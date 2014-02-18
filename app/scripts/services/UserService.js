(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', []).service('UserService', function UserService($q, $location) {

        // FIXME implement criptography
        
        //FIXME change default value to FALSE
        var logged = true;

        /**
         * @param {String}
         * @param {String}
         * @param {Boolean}
         */
        this.login = function(user, pass, rememberMe) {
            // TODO log into the driver

            // FIXME - save the md5
            localStorage.user = user;

            var deferred = $q.defer();

            setTimeout(function() {
                if (pass === 'marykay') {
                    deferred.resolve();
                    logged = true;
                } else {
                    deferred.reject();
                    logged = false;
                }
            }, 1500);

            return deferred.promise;
        };
        this.logout = function() {
            // TODO log out of the driver
            var deferred = $q.defer();
            
            setTimeout(function() {
                deferred.resolve();
                logged = false;
            }, 1500);
            
            return deferred.promise;
        };
        this.isLogged = function isLogged() {
            return logged;
        };
        this.redirectIfIsNotLoggedIn = function redirectIfIsNotLoggedIn() {
          if(!logged) {
              $location.path('/login');
          }  
        };
    });
})(angular);
