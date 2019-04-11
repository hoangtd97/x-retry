'use strict';

/**
 * Create function that generate timeout by [exponential backoff algorithm](http://dthain.blogspot.com/2009/02/exponential-backoff-in-distributed.html)
 * 
 * @param {Object} [options]
 * @param {Number} [options.minTimeout=20]
 * @param {Number} [options.maxTimeout=Infinite]
 * @param {Number} [options.factor=2] 
 * @param {Boolean} [options.randomize=true]
 * 
 * @return {Function} generate timeout
 */
function Timeout({ randomize = true, minTimeout = 20, maxTimeout = Number.MAX_SAFE_INTEGER, factor = 2 }={}) {

  /**
   * Generate timeout = Math.min(random * minTimeout * Math.pow(factor, retryCount), maxTimeout)
   * @param {number} [retryCount=1]
   * 
   * @return {number} timeout
   */
  function generateTimeout(retryCount = 1) {

    let random = 1;
  
    if (randomize) {
      random = 1 + Math.random();
    }
  
    return Math.min(random * minTimeout * Math.pow(factor, retryCount), maxTimeout);
  }

  return generateTimeout;
}

module.exports = Timeout;
