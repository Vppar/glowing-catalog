(function(angular) {
    'use strict';

    angular
    .module('tnt.catalog.user', ['tnt.catalog.sync.driver', 'tnt.catalog.sync.service'])
    .service('UserService', function UserService($q, SyncDriver, SyncService) {

        // FIXME implement criptography

        /**
         * @param {String}
         * @param {String}
         * @param {Boolean}
         */
        this.login = function(user, pass, rememberMe) {
            // FIXME - save the md5
            localStorage.user = user;

            var promise = SyncDriver.login(user, pass, rememberMe);

            promise.then(function () {
              SyncDriver.registerSyncService(SyncService);
            });

            return promise;
        };


        this.logout = function() {
            return SyncDriver.logout();
        };
    });
})(angular);
