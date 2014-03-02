(function(angular) {
	'use strict';

	angular.module('tnt.util.log', []).config(function($provide) {
        $provide.decorator('$log', function($delegate) {
            $delegate.fatal = $delegate.log;
            return $delegate;
        });
    }).service('logger', function logger($log) {
		// TODO Create a console interceptor to warn about the use of console.log
		return $log;
	}).service('log', function log(logger) {
	    logger.warn('You showld be using logger instead of log');
        return logger;
    });
})(angular);
