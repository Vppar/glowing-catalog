(function (angular, appCache) {
    'use strict';

    var manifest = angular.module('tnt.catalog.manifest', [
        'tnt.util.log', 'tnt.catalog.service.dialog'
    ]);

    manifest.service('CacheController', ['$q', '$rootScope', 'logger', 'DialogService', function CacheController ($q, $rootScope, logger,
        DialogService) {
        
        var log = logger.getLogger('tnt.catalog.manifest.CacheController');
        
        var deferred = $q.defer();

        function notify (evt) {
            deferred.notify(evt);
            $rootScope.$apply();
        }

        appCache.addEventListener('cached', notify, false);
        appCache.addEventListener('noupdate', notify, false);
        appCache.addEventListener('checking', notify, false);
        appCache.addEventListener('downloading', notify, false);
        appCache.addEventListener('error', notify, false);
        appCache.addEventListener('obsolete', notify, false);
        appCache.addEventListener('progress', notify, false);
        appCache.addEventListener('updateready', notify, false);

        function attachListener () {

            deferred.promise.then(null, null, function (e) {
                switch (e.type) {
                    case 'cached':
                        log.debug('data has just been cached!');
                        deferred.resolve('IDLE');
                        break;
                    case 'noupdate':
                        log.debug('the data we have is already up to date');
                        deferred.resolve('IDLE');
                        break;
                    case 'checking':
                        log.debug('Checking for updates');
                        break;
                    case 'downloading':
                        log.debug('fetching updates');
                        break;
                    case 'error':
                        log.debug('things gone south');
                        deferred.reject('ERROR');
                        break;
                    case 'obsolete':
                        log.debug('the manifest no longer exists... whaat?!');
                        deferred.reject('OBSOLETE');
                        break;
                    case 'progress':
                        log.debug('progress', e);
                        break;
                    case 'updateready':
                        log.debug('new data is ready! time to refresh.');
                        deferred.resolve('UPDATEREADY');
                        break;
                    default:
                        log.debug(e.type, e);
                }
            });

            deferred.promise.then(function (data) {
                console.log(data);

//                if (data === 'UPDATEREADY') {
//
//                    var dialog = {
//                        title : 'Atualização',
//                        message : 'Há uma nova versão disponivel, deseja atualizar agora?',
//                        btnNo : 'Não',
//                        btnYes : 'Sim'
//                    };
//
//                    DialogService.messageDialog(dialog).then(function () {
//                        window.location.reload();
//                    });
//                }
            });
        }

        function kickStart () {
            switch (appCache.status) {
                case appCache.UNCACHED: // UNCACHED == 0
                    deferred.notify({
                        type : 'error'
                    });
                    break;
                case appCache.IDLE: // IDLE == 1
                    deferred.notify({
                        type : 'noupdate'
                    });
                    break;
                case appCache.CHECKING: // CHECKING == 2
                    deferred.notify({
                        type : 'checking'
                    });
                    break;
                case appCache.DOWNLOADING: // DOWNLOADING == 3
                    deferred.notify({
                        type : 'downloading'
                    });
                    break;
                case appCache.UPDATEREADY: // UPDATEREADY == 4
                    deferred.notify({
                        type : 'updateready'
                    });
                    break;
                case appCache.OBSOLETE: // OBSOLETE == 5
                    deferred.notify({
                        type : 'obsolete'
                    });
                    break;
                default:
                    deferred.notify({
                        type : 'error'
                    });
                    break;
            }
        }
        attachListener();
        kickStart();

        /**
         * Returns a promise that is resolved on update start
         */
        this.checkForUpdates = function () {
            return deferred.promise['finally'](function () {
                deferred = $q.defer();
                attachListener();
                appCache.update();
            });
        };

        /**
         * Returns the promise currently attached to the active manifest
         * iteraction
         */
        this.getPromise = function () {
            return deferred.promise;
        };
    }]);
})(angular, window.applicationCache);
