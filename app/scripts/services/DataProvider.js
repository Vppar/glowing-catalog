(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.data', []).service('DataProvider', function DataProvider($http, FilteredArray) {

        var scope = this;

        this.cardData = {};
        this.date = {};

        this.customers = [];
        this.deliveries = [];
        this.entities = [];
        this.expenses = [];
        this.receivables = [];
        this.orders = [];
        this.payments = [];
        this.paymentTypes = [{id: 1, description: 'cash'}];
        this.phoneTypes = [];
        this.products = [];
        this.representative = {name: 'Valtanette de Paula'};
        this.states = [];
        this.products2 = new FilteredArray('id', 'line');
        this.lines = new FilteredArray('line');

        $http.get('resources/data.json').then(function(response) {

            scope.lines.mPush(response.data.lines);
            delete response.data.lines;
            
            angular.extend(scope, response.data);
            
            scope.customers.sort(function(x, y) {
                return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });
        });
        
        $http.get('resources/products.json').then(function(response) {
            angular.extend(scope.products2, response.data);
        });
    });
}(angular));
