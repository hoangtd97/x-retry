'use strict';

const ERR_REACHED_MAX_RETRY = require('@u-e-i/err-reached-max-retry');
const ERR_CANNOT_RETRY      = require('@u-e-i/err-cannot-retry');
const delay                 = require('delay');

/**
 * Retry an async function
 * @param {object} options
 * @param {function} options.func async function to retry
 * @param {object} [options.thisArg] this pointer apply to async func
 * @param {function} [options.isRetry] (error) => boolean
 * @param {number} [options.maxRetry=3] max retry times
 * @param {number|function} [options.timeout=200] delay between retry operation, 
 * if is function, must match interface : (retry_count, maxRetry, logs) => number
 * @param {activity} [options.activity] what is this activity name ? default is func.name
 * @param {string} [options.actor] who do this activity ? default is thisArg.name
 * 
 * @return {Promise<any>} result of async func
 * 
 * @throws [ERR_REACHED_MAX_RETRY](https://www.npmjs.com/package/@u-e-i/err-reached-max-retry)
 * @throws [ERR_CANNOT_RETRY](https://www.npmjs.com/package/@u-e-i/err-cannot-retry) when not reached max retry but isRetry() return false.
 */
async function asyncRetry({ func, thisArg, args = [], isRetry, maxRetry = 3, timeout = 200, actor, activity }) {
  
  if (typeof func !== 'function')                             { throw new TypeError(`Param func expect a function, but received ${func}`) }
  if (isRetry !== undefined && typeof isRetry !== 'function') { throw new TypeError(`Param isRetry expect a function, but received ${isRetry}`) }
  if (!(maxRetry > 0))                                        { throw new TypeError(`Param maxRetry expect a positive number, but received ${maxRetry}`) }
  if (!(timeout > 0 || typeof timeout === 'function'))        { throw new TypeError(`Param timeout expect a positive number or function, but received ${maxRetry}`) }

  actor    = actor ? actor : thisArg ? thisArg.name : '';
  activity = activity ? activity : func.name;

  const logs = [];

  for (let retry_count = 0; retry_count < maxRetry; retry_count++) {

    let start_at = Date.now();

    try {
      let result = await func.apply(thisArg, args);
      return result;
    }
    catch (err) {
      logs.push({ time : Date.now() - start_at, error : err });

      if (typeof isRetry === 'function' && !isRetry(err)) {
        throw new ERR_CANNOT_RETRY({
          actor    : actor,
          activity : activity,
          logs     : logs
        });
      }

      let applied_timeout = timeout;
      if (typeof timeout === 'function') {
        applied_timeout = timeout(retry_count, maxRetry, logs);
      }

      await delay(applied_timeout);
    }
  }

  throw new ERR_REACHED_MAX_RETRY({
    actor    : actor,
    activity : activity,
    logs     : logs
  });
}

module.exports = asyncRetry;