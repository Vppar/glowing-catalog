(function(angular) {
    'use strict';

    angular.module('tnt.utils.cep', []).service('CepService', ['$q', '$http', function ArrayUtils($q, $http) {

        this.search = function(CEP) {
            var deferred = $q.defer();

            $http.get('https://vopp.com.br/api/cep/' + CEP + '.json').then(function(result) {
                if (angular.isObject(result.data)) {
                    deferred.resolve(result.data);
                } else {
                    deferred.reject({
                        status : 404,
                        message : 'Could not find an address for ' + CEP
                    });
                }
            }, function(error) {
                deferred.reject({
                    status : 500,
                    message : 'Unable to cantact the servers',
                    data : error
                });
            });
            return deferred.promise;
        };
    }]);
})(angular);
