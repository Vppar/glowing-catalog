(function(angular) {
    'use strict';

    angular
    .module('tnt.catalog.user', ['tnt.catalog.sync.driver', 'tnt.catalog.sync.service'])
    .service('UserService', function UserService($q, $location, SyncDriver, SyncService) {

        // FIXME implement criptography
        
        //FIXME change default value to FALSE
        var logged = true;

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
              logged = true;
              SyncDriver.registerSyncService(SyncService);
            });

            return promise;
        };


        this.logout = function() {
            var promise = SyncDriver.logout();

            logged = false;

            promise.then(function () {
              logged = false;
            });
            
            return promise;
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
