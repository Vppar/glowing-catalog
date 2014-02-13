(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', []).service('UserService', function UserService($q) {

        // FIXME implement criptography

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
                } else {
                    deferred.reject();
                }
            }, 1500);

            return deferred.promise;
        };
        this.logout = function() {
            // TODO log out of the driver
            var deferred = $q.defer();
            
            setTimeout(function() {
                deferred.resolve();
            }, 1500);
            
            return deferred.promise;
        };
    });
})(angular);
