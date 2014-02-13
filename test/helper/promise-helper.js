


/**
 * A helper for creating functions that return a rejected/resolved promise
 * to be used in tests.
 * @type {Object}
 */
var PromiseHelper = (function () {
  var defaultQ = null;
  var defaultLogger = null;

  function createPromiseGetter(resolve, result, logger, q, timeout) {
    q = angular.isDefined(q) ? q : defaultQ;
    logger = angular.isDefined(logger) ? logger : defaultLogger;

    if (!q) {
      throw('Missing $q! See "PromiseHelper.setQ()".');
    }

    return function () {
      var deferred = q.defer();

      setTimeout(function () {
        if (logger) {
          var msg = (resolve ? 'Resolved' : 'Rejected') + ' promise with result';
          logger(msg, result);
        }

        resolve ?
          deferred.resolve(result) :
          deferred.reject(result);
      }, timeout || 0);

      return deferred.promise;
    };
  }

  return {

    /**
     * Sets the $q object from which we get the deferred objects. This will
     * be called after injecting $q in a test suite, usually in a
     * beforeEach() block.
     * @param {Object} q The $q object to be used.
     */
    setQ : function (q) {
      defaultQ = q;
    },

    /**
     * Sets the default logger to be used in the generated promises.
     * @param {Function} logger The logger function.
     */
    setLogger : function (logger) {
      defaultLogger = logger;
    },

    /**
     * Returns a promise that will be resolved.
     * @param {*} result The result returned by the promise.
     * @param {function?} logger A logger function.
     * @param {Number?} timeout Time in milliseconds to wait before resolving
     *  the promise.
     * @return {Promise} A promise that is assured to be resolved.
     */
    resolved : angular.bind(null, createPromiseGetter, true),

    /**
     * Returns a promise that will be rejected.
     * @param {*} result The result returned by the promise.
     * @param {function?} logger A logger function.
     * @param {Number?} timeout Time in milliseconds to wait before rejected
     *  the promise.
     * @return {Promise} A promise that is assured to be rejected.
     */
    rejected : angular.bind(null, createPromiseGetter, false)
  };
})();

