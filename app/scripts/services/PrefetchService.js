(function(angular) {
    'use strict';

    angular.module('tnt.catalog.prefetch.service', []).service('PrefetchService', function PrefetchService($http, $log) {

        this.doIt = function() {
            // cache warmUp
            $http.get('wishlist.manifest').success(function(data) {
                var list = data.split(/\n/);
                $log.debug('list is ' + list.length + ' long');
                for ( var ix in list) {
                    if (list[ix].indexOf("/") != -1) {
                        $http.get(list[ix]);
                    }
                }
            });
        };
    });
}(angular));
