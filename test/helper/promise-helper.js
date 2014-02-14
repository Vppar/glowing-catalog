
/**
 * A helper for creating functions that return a rejected/resolved promise
 * to be used in tests.
 *
 * Usage:
 *
 * beforeEach(inject(function ($q, $log) {
 *   PromiseHelper.config($q, $log.debug);
 * });
 *
 * And setup a spy:
 *
 * foo.bar = jasmine.createSpy('foo.bar').andCallFake(PromiseHelper.resolved('yay'));
 * foo.baz = jasmine.createSpy('foo.baz').andCallFake(PromiseHelper.rejected('aw...'));
 *
 * @type {Object}
 */
var PromiseHelper = (function () {
  var config = {
    q : null,
    logger : null
  };

  function createPromiseGetter(resolve, result, timeout, logger, q) {
    q = angular.isDefined(q) ? q : config.q;
    logger = angular.isDefined(logger) ? logger : config.logger;

    if (!q) {
      throw('Missing $q! See "PromiseHelper.config()".');
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
     * Configures the promise helper.
     * @param {Object} q The $q object from with which we create deferred
     *  objects.
     * @param {Function} logger A logger function, such as {@code console.log}.
     */
    config : function (q, logger) {
      config.q = q;
      config.logger = logger;
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

