(function(angular) {
    'use strict';
    angular.module('tnt.catalog', []).service('DataProvider', function DataProvider($http) {

        var scope = this;

        this.date = {};
        this.products = [];
        this.customers = [];
        this.states = {};
        this.phone = {};
        this.cardData = {};
        this.orders = [];
        this.payments = [];
        this.deliveries = [];

        $http.get('resources/data.json').then(function(response) {
            angular.extend(scope, response.data);
            scope.customers.sort(function(x, y) {
                return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });
        });
    });
}(angular));
