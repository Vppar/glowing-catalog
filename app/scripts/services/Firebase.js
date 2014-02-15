(function(angular, Firebase, FirebaseSimpleLogin) {
  'use strict';
  
  angular.module('tnt.catalog.sync.firebase', []).factory('Firebase', function() {
    return Firebase;
  }).factory('FirebaseSimpleLogin', function() {
    return FirebaseSimpleLogin;
  });
}(angular, Firebase, FirebaseSimpleLogin));
