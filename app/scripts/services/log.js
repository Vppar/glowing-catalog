(function(angular) {
  'use strict';

  angular.module('tnt.util.log', []).service('log', function log($log) {
    return $log;
  }).config(function($provide) {
    $provide.decorator('$log', function($delegate) {
      $delegate.fatal = $delegate.log;
      return $delegate;
    });
  });
})(angular);
