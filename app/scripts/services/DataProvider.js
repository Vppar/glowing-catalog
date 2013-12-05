(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.data', []).service('DataProvider', function DataProvider($http) {

        var scope = this;

        this.cardData = {};
        this.date = {};
        this.deliveries = [];
        this.customers = [];
        this.orders = [];
        this.phone = {};
        this.products = [];
        this.payments = [];
        this.representative = {name: 'Valtanette de Paula'};
        this.states = {};

        $http.get('resources/data.json').then(function(response) {
            angular.extend(scope, response.data);
            scope.customers.sort(function(x, y) {
                return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });
        });
    });
}(angular));
