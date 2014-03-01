(function(angular) {
	'use strict';

	angular.module('tnt.util.log', []).service('log', function log($log) {
		$log.warn('You showld be using logger instead of log');
		return $log;
	}).service('logger', function logger($log) {
		// TODO Create a console interceptor to warn about the use of console.log
		return $log;
	}).config(function($provide) {
		$provide.decorator('$log', function($delegate) {
			$delegate.fatal = $delegate.log;
			return $delegate;
		});
	});
})(angular);
