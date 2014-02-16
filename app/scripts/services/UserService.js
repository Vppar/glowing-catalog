(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', ['tnt.catalog.sync.driver']).service('UserService', function UserService($q, SyncDriver) {

        // FIXME implement criptography

        /**
         * @param {String}
         * @param {String}
         * @param {Boolean}
         */
        this.login = function(user, pass, rememberMe) {
            // FIXME - save the md5
            localStorage.user = user;

            return SyncDriver.login(user, pass, rememberMe);
        };


        this.logout = function() {
            return SyncDriver.logout();
        };
    });
})(angular);
