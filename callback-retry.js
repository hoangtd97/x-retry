'use strict';

const ERR_REACHED_MAX_RETRY = require('@u-e-i/err-reached-max-retry');
const ERR_CANNOT_RETRY      = require('@u-e-i/err-cannot-retry');

/**
 * Retry an callback based function
 * @param {object} options
 * @param {function} options.func callback based function to retry
 * @param {object} [options.thisArg] this pointer apply to function
 * @param {function} [options.callback] callback of function
 * @param {function} [options.isRetry] (error) => boolean
 * @param {number} [options.maxRetry=3] max retry times
 * @param {number|function} [options.timeout=200] delay between retry operation, 
 * if is function, must match interface : (retry_count, maxRetry, logs) => number
 * @param {activity} [options.activity] what is this activity name ? default is func.name
 * @param {string} [options.actor] who do this activity ? default is thisArg.name
 * 
 * @return {void}
 * 
 * @errors :
 * * [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
 * * [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.
 */
function callbackRetry({ func, thisArg, args = [], callback, isRetry, maxRetry = 3, retry_count = 0, timeout = 200, logs = [], actor, activity }) {
  
  if (typeof func !== 'function')                               { throw new TypeError(`Param func expect a function, but received ${func}`) }
  if (isRetry !== undefined && typeof isRetry !== 'function')   { throw new TypeError(`Param isRetry expect a function, but received ${isRetry}`) }
  if (!(maxRetry > 0))                                          { throw new TypeError(`Param maxRetry expect a positive number, but received ${maxRetry}`) }
  if (!(timeout > 0 || typeof timeout === 'function'))          { throw new TypeError(`Param timeout expect a positive number or function, but received ${maxRetry}`) }

  if (callback !== undefined && typeof callback !== 'function') { throw new TypeError(`Param callback expect a function, but received ${callback}`) }

  actor    = actor ? actor : thisArg ? thisArg.name : '';
  activity = activity ? activity : func.name;

  if (retry_count >= maxRetry) {
    return callback(new ERR_REACHED_MAX_RETRY({
      actor    : actor,
      activity : activity,
      logs     : logs
    }));
  }

  let start_at = Date.now();

  args.push((err, ...res) => {
    if (err) {

      retry_count++;

      logs.push({ time : Date.now() - start_at, error : err });

      if (typeof isRetry === 'function' && !isRetry(err)) {
        return callback(new ERR_CANNOT_RETRY({
          actor    : actor,
          activity : activity,
          logs     : logs
        }));
      }

      let applied_timeout = timeout;
      if (typeof timeout === 'function') {
        applied_timeout = timeout(retry_count, maxRetry, logs);
      }

      return setTimeout(() => callbackRetry({ func, thisArg, args, callback, maxRetry, retry_count, timeout, logs, actor, activity }), applied_timeout);
    }
    else {
      return callback(null, ...res);
    }
  });

  return func.apply(thisArg, args);
}

module.exports = callbackRetry;