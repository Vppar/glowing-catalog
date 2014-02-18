(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', [
        'angular-md5', 'tnt.catalog.sync.driver', 'tnt.catalog.sync.service'
    ]).service('UserService', function UserService($q, $location, md5, SyncDriver, SyncService) {

        // FIXME change default value to FALSE
        var logged = true;
        var SALT = '7un7sC0rp';

        /**
         * @param {String}
         * @param {String}
         * @param {Boolean}
         */
        this.loginOnline = function loginOnline(user, pass) {
            var promise = SyncDriver.login(user, pass);
            promise.then(function() {
                logged = true;
                SyncDriver.registerSyncService(SyncService);
            });

            return promise;
        };

        this.loggedIn = function loggedIn(user, pass) {
            var hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
            localStorage.hashMD5 = hashMD5;
            return hashMD5;
        };

        this.loginOffline = function loginOffline(user, pass) {
            var result = $q.reject();
            if (localStorage.hashMD5) {
                var hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
                if (localStorage.hashMD5 === hashMD5) {
                    result = true;
                }
            }
            return result;
        };

        this.login = function(user, pass, rememberMe) {
            var onlineLoggedPromise = this.loginOnline(user, pass);
            var loggedIn = this.loggedIn;
            var loginOffline = this.loginOffline;
            var loggedPromise = onlineLoggedPromise.then(function() {
                return loggedIn(user, pass);
            }, function() {
                return loginOffline(user, pass);
            });

            return loggedPromise;
        };
        this.logout = function() {
            // TODO log out of the driver
            var promise = SyncDriver.logout();
            
            promise.then(function(){
                logged = false;
            });
            return promise;
        };
        this.isLogged = function isLogged() {
            return logged;
        };
        this.redirectIfIsNotLoggedIn = function redirectIfIsNotLoggedIn() {
            if (!logged) {
                $location.path('/login');
            }
        };

    });
})(angular);