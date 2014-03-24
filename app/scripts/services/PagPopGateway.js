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
                    if (data && data.transacao && (Number(data.transacao.codigo_retorno) === 0)) {
                        log.info('Credit card payment processed.', data);
                        deferred.resolve(data);
                    } else {
                        log.fatal('An error has occour while processing a credit card payment.', data);
                        deferred.reject({
                            status : 'conn',
                            message : 'There was an error contacting the server.'
                        });
                    }
                }).error(function(err) {
                    var rejection = null;
                    if (err && err.errors && err.errors.bandeira) {
                        rejection = {
                            status : '-3',
                            message : 'Invalid credit card number'
                        };
                    } else {
                        rejection = {
                            status : 'conn',
                            message : 'There was an error contacting the server.'
                        };
                    }
                    log.fatal('An error occur while processing a credit card payment', err);
                    deferred.reject(rejection);
                });
                return deferred.promise;
            };
        }
    ]);
}(angular));
