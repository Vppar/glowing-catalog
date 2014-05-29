(function(angular) {
    'use strict';

    angular.module('tnt.catalog.user', [
        'tnt.util.log', 'angular-md5', 'tnt.catalog.sync.driver', 'tnt.catalog.sync.service', 'tnt.catalog.prefetch.service', 'tnt.catalog.config', 'tnt.catalog.service.dialog'
    ]).service('UserService', ['$q', '$location', '$timeout', 'logger', 'md5', 'SyncDriver', 'SyncService', 'PrefetchService', 'CatalogConfig', 'DialogService', function UserService($q, $location, $timeout, logger, md5, SyncDriver, SyncService, PrefetchService, CatalogConfig, DialogService) {

        var log = logger.getLogger('tnt.catalog.user.UserService');
        
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

            var deferred = $q.defer();

            var promise = SyncDriver.login(user, pass);

            var timer = $timeout(function(){
                if(localStorage.hashMD5) {
                    var message = 'Login is taking too long, falling back!';
                    log.error(message);
                    deferred.reject(message);
                } else {
                    var message = 'Login is taking too long, cannot fallback because the device is new!';
                    log.fatal(message);
                }
            }, 5000);

            promise['finally'](function(){
                $timeout.cancel(timer);
            });

            promise.then(function(resolution) {
                logged = true;
                PrefetchService.doIt();
                deferred.resolve(resolution);
            }, function(rejection){
                deferred.reject(rejection);
            });

            return deferred.promise;
        };


        function setUserMD5(user, pass) {
            var hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);
            localStorage.hashMD5 = hashMD5;
            return hashMD5;
        }


        this.loggedIn = function loggedIn(user, pass) {
            logger.getLogger('remotedebug.version').info(CatalogConfig.version);
            var hashMD5 = setUserMD5(user, pass);
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
            } else if (err && err.code === 'SERVER_ERROR' && !localStorage.hashMD5) {
                result = $q.reject(err);
            } else {
                result = userService.loginOffline(user, pass);
            }
            return result;
        };

        this.login = function(user, pass) {
            var dialogData = {};

            dialogData.step = {
              value : 0,
              message : 'Autenticando...'
            };

            var dialog = DialogService.openDialogLoading(dialogData);

            var onlineLoggedPromise = this.loginOnline(user, pass);
            var loggedIn = this.loggedIn;
            var onlineLoginErrorHandler = this.onlineLoginErrorHandler;
            var loggedPromise = onlineLoggedPromise.then(function() {
                return loggedIn(user, pass);
            }, function(err) {
                return onlineLoginErrorHandler(err, user, pass);
            });

            function closeLoadingDialog() {
                dialog.$scope.cancel();
            }

            return loggedPromise
                .then(function () {
                    dialogData.step.value = 50;
                    dialogData.step.message = 'Carregando dados locais...';

                    return SyncService.resync().then(function () {
                        dialogData.step.value = 75;
                        dialogData.step.message = 'Atualizando dados...';

                        return SyncDriver.registerSyncService(SyncService).then(function () {
                            var deferred = $q.defer();

                            dialogData.step.value = 100;
                            dialogData.step.message = 'Inicializando aplicação.';

                            setTimeout(function () {
                              deferred.resolve();
                            }, 1000);

                            return deferred.promise;
                        });
                    });
                })

                .finally(closeLoadingDialog);
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




        /**
         * Updates the current user's password and updates his/her MD5 hash.
         * @param {string} oldPassword The user's old password.
         * @param {string} newPassword The user's new password.
         * @return {Object} A promise that will be resolved when the password
         *    is updated or rejected if something else happens while trying to
         *    update it.
         */
        function changePassword(oldPassword, newPassword) {
            var user = localStorage.user;

            if (!user) {
                return $q.reject('Not connected to Firebase!');
            }

            var promise = SyncDriver.changePassword(user, oldPassword, newPassword);

            return promise.then(function () {
                setUserMD5(user, newPassword);
            });
        }


        this.changePassword = changePassword;


    }]);
})(angular);
