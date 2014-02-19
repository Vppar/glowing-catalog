(function(angular) {
    'use strict';

    angular.module('tnt.catalog.gopay.gateway', []).service('GoPayGateway', function GoPayGateway($q, $http) {
        this.pay = function(data) {
            var deferred = $q.defer();

            $http({
                method : 'POST',
                url : 'http://be7-atl1.vopp.tunts.net/gopay/insertCreditCardPayment/?token=fa87wy4fnhw78fjw78fh9w87f8796wjyf36g6f92374',
                data : data,
            }).success(function(data) {
                if (data.Status !== 0) {
                    deferred.reject(data);
                } else {
                    deferred.resolve(data);
                }
            }).error(function() {
                deferred.reject('There was an error contacting the server');
            });

            return deferred.promise;
        };
    });
}(angular));