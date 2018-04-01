Memory leader
===========
[![Build Status](https://travis-ci.org/Initbee/memory-leader.svg?branch=master)](https://travis-ci.org/Initbee/memory-leader)
[![Dependencies Status](https://david-dm.org/Initbee/memory-leader/status.svg)](https://david-dm.org/Initbee/memory-leader)
[![devDependencies Status](https://david-dm.org/Initbee/memory-leader/dev-status.svg)](https://david-dm.org/Initbee/memory-leader?type=dev)
[![NPM](https://img.shields.io/npm/v/memory-leader.svg?style=flat)](http://npm.im/memory-leader)
[![NPM downloads](http://img.shields.io/npm/dm/memory-leader.svg?style=flat)](http://npm.im/memory-leader)

Leader election backed on memory, based on [redis-leader](https://github.com/pierreinglebert/redis-leader). Fully supported API.

## Install

```
npm install memory-leader
```

## Examples

```javascript

const Leader = require('memory-leader');

```

## API

### new Leader(options)

  Create a new Leader

#### options

  `ttl` Lock time to live in milliseconds (will be automatically released after that time)

  `wait` Time between 2 tries getting elected (ms)

### stop (callback)

  Release the lock for others.

### isLeader (callback)

  Tells if he got elected.

  callback(err, true/false)

### Events

`elected` when your candidate become leader

`revoked` when your leader got revoked from his leadership

`error` when an error occurred, best is to exit your process


## How it works

Try to set a semaphore with the `ttl` given in options.
 - If it succeeds, it gets elected and will renew the semaphore every `ttl/2` ms.
 - If it fails or get revoked, it tries to get elected every `wait` ms.

## License

  GPLv3
