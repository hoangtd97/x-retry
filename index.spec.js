'use strict';

const { callbackRetry, asyncRetry, Timeout } = require('.');
const assert = require('assert');

const BusyService = {
  success_at : 3,
  call_times : 0,
  getHelloAtEach3Times : async function (must_be_hi, callback) {
    this.call_times++;
    
    if (must_be_hi !== 'hi') {  

      let InvalidDataError = new Error('Must be hi');
      InvalidDataError.status = 400;

      if (typeof callback === 'function') {
        return callback(InvalidDataError);
      }
      throw InvalidDataError;
    }

    if (this.call_times % this.success_at !== 0) {
      let BusyError = new Error('Service is busy');
      BusyError.status = 503;

      if (typeof callback === 'function') {
        return callback(BusyError);
      }
      throw BusyError;
    }

    if (typeof callback === 'function') {
      return callback(null, 'hello');
    }

    return 'hello';
  }
};

it ('should retry a callback function ok after three times', (done) => {
  callbackRetry({
    func      : BusyService.getHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 3,
    callback  : (err, message) => (!err && message === 'hello') ? done() : done(err),
    timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 })
  });
});

it ('should retry a callback function fail with error ERR_REACHED_MAX_RETRY after two times', (done) => {
  callbackRetry({
    func      : BusyService.getHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 2,
    timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 }),
    callback  : (err, message) => (err.code === 'ERR_REACHED_MAX_RETRY' && !message) ? done() : done(err)
  });
});

it ('should retry a callback function fail with error ERR_CANNOT_RETRY after one times when passing invalid input', (done) => {
  callbackRetry({
    func      : BusyService.getHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['not_hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 3,
    timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 }),
    callback  : (err, message) => (err.code === 'ERR_CANNOT_RETRY' && err.logs.length === 1 && !message) ? done() : done(err)
  });
});

it ('should retry a async function ok after three times', async () => {
  let message = await asyncRetry({
    func      : BusyService.getHelloAtEach3Times,
    thisArg   : BusyService,
    args      : ['hi'],
    isRetry   : (error) => !(error.status >= 400 && error.status < 500),
    maxRetry  : 3,
    timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 })
  });

  assert.equal(message, 'hello');
});

it ('should retry a async function fail with error ERR_REACHED_MAX_RETRY after two times', async () => {
  try {
    let message = await asyncRetry({
      func      : BusyService.getHelloAtEach3Times,
      thisArg   : BusyService,
      args      : ['hi'],
      isRetry   : (error) => !(error.status >= 400 && error.status < 500),
      maxRetry  : 2,
      timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 })
    });
  }
  catch (err) {
    assert.equal(err.code, 'ERR_REACHED_MAX_RETRY');
  }
});

it ('should retry a async function fail with error ERR_CANNOT_RETRY after one times when passing invalid input', async () => {
  try {
    let message = await asyncRetry({
      func      : BusyService.getHelloAtEach3Times,
      thisArg   : BusyService,
      args      : ['not_hi'],
      isRetry   : (error) => !(error.status >= 400 && error.status < 500),
      maxRetry  : 3,
      timeout   : Timeout({ minTimeout : 20, maxTimeout : 10000 })
    });
  }
  catch (err) {
    assert.ok(err.code === 'ERR_CANNOT_RETRY' && err.logs.length === 1);
  }
});

it ('should generate timeout by exponential backoff algorithm', () => {
  let minTimeout = 10;
  let maxTimeout = 10000;
  
  let generateTimeout = Timeout({ minTimeout, maxTimeout });

  let first_timeout = generateTimeout(1);
  let second_timeout = generateTimeout(2);

  assert.ok(first_timeout >= minTimeout && first_timeout <= maxTimeout);
  assert.ok(second_timeout >= minTimeout && second_timeout <= maxTimeout);
  assert.ok(first_timeout < second_timeout);
});