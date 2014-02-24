(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', [
        'angular-md5', 'tnt.catalog.sync.driver', 'tnt.catalog.sync.service', 'tnt.catalog.prefetch.service'
    ]).service('UserService', function UserService($q, $location, md5, SyncDriver, SyncService, PrefetchService) {

        // FIXME change default value to FALSE
        var logged = false;
        var SALT = '7un7sC0rp';
        var userService = this;

        /**
         * @param {String}
         * @param {String}
         * @param {Boolean}
         */
        this.loginOnline = function loginOnline(user, pass) {
            var promise = SyncDriver.login(user, pass);
            promise.then(function() {
                logged = true;
                PrefetchService.doIt();
                SyncDriver.registerSyncService(SyncService);
            });

            return promise;
        };

        this.loggedIn = function loggedIn(user, pass) {
            var hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
            localStorage.hashMD5 = hashMD5;
            localStorage.user = user;
            return hashMD5;
        };

        this.loginOffline = function loginOffline(user, pass) {
            var result = $q.reject();
            if (localStorage.hashMD5) {
                var hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
                if (localStorage.hashMD5 === hashMD5) {
                    logged = true;
                    result = true;
                }
            }
            return result;
        };

        this.onlineLoginErrorHandler = function onlineLoginErrorHandler(err, user, pass) {
            var result = null;
            if (err && err.code === 'INVALID_EMAIL') {
                result = $q.reject(err);
            } else if (err && err.code === 'INVALID_PASSWORD') {
                var oldHashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
                if (localStorage.hashMD5 === oldHashMD5) {
                    // password changed
                    delete localStorage.hashMD5;
                }
                result = $q.reject(err);
            } else {
                result = userService.loginOffline(user, pass);
            }
            return result;
        };

        this.login = function(user, pass, rememberMe) {
            var onlineLoggedPromise = this.loginOnline(user, pass);
            var loggedIn = this.loggedIn;
            var onlineLoginErrorHandler = this.onlineLoginErrorHandler;
            var loggedPromise = onlineLoggedPromise.then(function() {
                return loggedIn(user, pass);
            }, function(err) {
                return onlineLoginErrorHandler(err, user, pass);
            });

            // FIXME: This should initialize warm up data during development.
            // Should be removed ASAP!
            loggedPromise.then(function () {
              SyncService.resync();
            });

            return loggedPromise;
        };

        this.logout = function() {
            // TODO log out of the driver
            var promise = SyncDriver.logout();

            promise.then(function() {
                logged = false;
            });
            return promise;
        };

        this.isLogged = function isLogged() {
            return logged;
        };
        
        this.redirectIfIsNotLoggedIn = function redirectIfIsNotLoggedIn() {
            if (!this.isLogged()) {
                SyncDriver.logout().then(function(){
                    $location.path('/login');
                });
                
            }
        };


        this.hasUnsyncedData = function hasUnsyncedData() {
            return SyncService.hasUnsyncedEntries();
        };

        this.clearData = function clearData() {
            localStorage.clear();
            return SyncService.clearData();
        };

    });
})(angular);
