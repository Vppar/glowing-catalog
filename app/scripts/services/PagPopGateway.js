(function (angular) {
    'use strict';

    angular.module('tnt.catalog.pagpop.gateway', []).service('PagPopGateway', [
        '$q', '$http', 'logger', function PagPopGateway($q, $http, logger) {

            var log = logger.getLogger('tnt.catalog.pagpop.gateway.PagPopGateway');

            this.pay = function (data) {
                var deferred = $q.defer();
                var token = localStorage.ppToken;
                $http({
                    method: 'POST',
                    url: 'https://vopp.com.br/pagpop/card/?token=' + token,
                    data: data
                }).success(function (data) {
                    if (data && data.transacao &&
                        (data.transacao.situacao === 'demonstrativo' || data.transacao.situacao === 'aprovado')) {
                        log.info('Credit card payment processed.', data);
                        deferred.resolve(data);
                    } else {
                        log.fatal('Transaction rejected.', data);
                        deferred.reject({
                            status: 'rejected',
                            message: 'Transaction rejected.'
                        });
                    }
                }).error(function (err) {
                        var rejection = null;
                        if (err && err.errors) {
                            if (err.errors.bandeira) {
                                rejection = {
                                    status: 'invalidCard',
                                    message: 'Invalid credit card number'
                                };
                            } else if (err.errors.base) {
                                rejection = {
                                    status: 'minAmount',
                                    message: 'Transaction rejected.'
                                };
                            } else {
                                rejection = {
                                    status: 'rejected',
                                    message: 'Transaction rejected.'
                                };
                            }
                        } else {
                            rejection = {
                                status: 'conn',
                                message: 'There was an error contacting the server.'
                            };
                        }
                        log.fatal('An error occur while processing a credit card payment', err);
                        deferred.reject(rejection);
                    }
                )
                ;
                return deferred.promise;
            };
        }
    ])
    ;
}(angular));
