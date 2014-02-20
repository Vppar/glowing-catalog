(function(angular) {
    'use strict';

    angular.module('tnt.catalog.gopay.gateway', []).service('GoPayGateway', function GoPayGateway($q, $http) {
        this.pay = function(data) {
            var deferred = $q.defer();
            var token = localStorage.gpToken;
            $http({
                method : 'POST',
                url : 'http://vopp.tunts.net/gopay/insertCreditCardPayment/?token='+token,
                data : data,
            }).success(function(data) {
                if (data.Status !== 0) {
                    deferred.reject(data);
                } else {
                    deferred.resolve(data);
                }
            }).error(function() {
                deferred.reject({Status: 'conn', Message: 'There was an error contacting the server'});
            });

            return deferred.promise;
        };
    });
}(angular));
