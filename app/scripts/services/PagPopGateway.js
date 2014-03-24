(function(angular) {
    'use strict';

    angular.module('tnt.catalog.pagpop.gateway', []).service('PagPopGateway', [
        '$q', '$http', 'logger', function PagPopGateway($q, $http, logger) {
            
            var log = logger.getLogger('tnt.catalog.pagpop.gateway.PagPopGateway');
            
            this.pay = function(data) {
                var deferred = $q.defer();
                var token = localStorage.ppToken;
                $http({
                    method : 'POST',
                    url : 'https://vopp.com.br/pagpop/card/?token=' + token,
                    data : data,
                }).success(function(data) {
                    if (data.Status !== 0) {
                        deferred.reject(data);
                    } else {
                        deferred.resolve(data);
                    }
                }).error(function(result) {
                    log.fatal('PapPopGateway.pay: An error has occour while processing a credit card payment.', result);
                    deferred.reject({
                        Status : 'conn',
                        Message : 'There was an error contacting the server'
                    });
                });

                return deferred.promise;
            };
        }
    ]);
}(angular));
