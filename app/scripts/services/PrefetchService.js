(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.prefetch.service', [
            'tnt.catalog.service.dialog'
        ])
        .service(
            'PrefetchService',
            ['$q', '$http', '$log', 'DialogService',
            function PrefetchService ($q, $http, $log, DialogService) {

                this.doIt = function () {
                    console.log('doIt should no longer be necessary');
                };

                function oldDoIt () {
                    // cache warmUp
                    $http
                        .get('wishlist.manifest')
                        .success(
                            function (data) {
                                var list = data.split(/\n/);
                                $log.debug('list is ' + list.length + ' long');

                                var promises = [];

                                for ( var ix in list) {
                                    if (list[ix].indexOf("/") != -1) {
                                        var deferred = $q.defer();
                                        $http.get(list[ix]).success(deferred.resolve).error(
                                            deferred.reject);

                                        promises.push(deferred.promise);
                                    }
                                }

                                $q
                                    .all(promises)
                                    .then(
                                        function () {
                                            DialogService
                                                .messageDialog({
                                                    title : 'Atualização',
                                                    message : 'A atualização foi concluida, você já pode utilizar seu aplicativo offline.',
                                                    btnYes : 'OK'
                                                });
                                        });
                            });
                }
                ;
            }]);
}(angular));
