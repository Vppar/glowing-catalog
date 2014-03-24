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
                    if (data && data.transacao && data.transacao.codigo_retorno === '0') {
                        log.info('Credit card payment processed.', data);
                        deferred.resolve(data);
                    } else {
                        log.info('An error has occour while processing a credit card payment.', data);
                        deferred.reject(data);
                    }
                }).error(function(result) {
                    if (result !== '') {
                        log.fatal('An error occur while processing a credit card payment', result);
                    }
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
