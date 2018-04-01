'use strict';

const crypto = require('crypto'),
  NodeCache = require('node-cache'),
  util = require('util'),
  uuidv4 = require('uuid/v4'),
  EventEmitter = require('events').EventEmitter;

// Make the key less prone to collision
var hashKey = function(key) {
  return 'leader:' + crypto.createHash('sha1').update(key).digest('hex');
};

function Leader(options) {
  options = options || {};
  this.id = uuidv4();
  this.options = {};
  this.options.ttl = Math.floor( (options.ttl || 10000) / 1000); // Lock time to live in seconds
  this.options.wait = options.wait || 1000; // time between 2 tries to get lock
  this.cache = new NodeCache({ 'stdTTL': this.options.ttl });
  this.key = hashKey(options.key || 'default');
}

util.inherits(Leader, EventEmitter);

/**
 * Renew leader as elected
 */
Leader.prototype._renew = function _renew() {
  
  this.isLeader(function(err, isLeader) {
    
    if(isLeader) {

      this.cache.ttl(this.key, this.options.ttl, function(err) {

        if(err) {
          this.emit('error', err);
        }
    
      }.bind(this));
    
    } else {

      clearInterval(this.renewId);
      this.electId = setTimeout(Leader.prototype.elect.bind(this), this.options.wait);
      this.emit('revoked');
    }
  
  }.bind(this));
};

/**
 * Try to get elected as leader
 */
Leader.prototype.elect = function elect() {
  
  this.cache.set(this.key, this.id, this.options.ttl, function(err, res) {
    
    if(err) {
      return this.emit('error', err);
    }
    
    if(res !== null) {
    
      this.emit('elected');
      this.renewId = setInterval(Leader.prototype._renew.bind(this), this.options.ttl / 2);
    
    } else {
    
      this.electId = setTimeout(Leader.prototype.elect.bind(this), this.options.wait);
    }
  }.bind(this));
};

Leader.prototype.isLeader = function isLeader(done) {
  
  this.cache.get(this.key, function(err, id){
  
    if(err) {
      return done(err);
    }

    done(null, (id === this.id));
  
  }.bind(this));
};

/**
 * if leader, stop being a leader
 * stop trying to be a leader
 */
Leader.prototype.stop = function stop() {
  
  this.isLeader(function(err, isLeader) {
  
    if(isLeader) {
  
      this.cache.del(this.key, function(err) {
  
        if(err) {
          return this.emit('error', err);
        }
    
        this.emit('revoked');
    
      }.bind(this));
    }
    
    clearInterval(this.renewId);
    clearTimeout(this.electId);
  
  }.bind(this));
};

module.exports = Leader;