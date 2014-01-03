(function(angular) {
    'use strict';
    angular.module('tnt.catalog.service.data', []).service('DataProvider', function DataProvider($http, $rootScope) {

        var scope = this;
        
        this.gopay = {};
        this.gopay.merchant = '4';
        this.gopay.token = 'bd653333319902a290102188713791401d5832356ff3875ee9b2b173cae2b4c3610d24d04ee7c4169bd99c4f93';

        this.cardData = {};
        this.date = {};

        this.customers = [];
        this.deliveries = [];
        this.entities = [];
        this.expenses = [];
        this.receivables = [];
        this.orders = [];
        this.payments = [];
        this.paymentTypes = [
            {
                id : 1,
                description : 'cash'
            }
        ];
        this.phoneTypes = [];
        this.representative = {
            name : 'Valtanette de Paula'
        };
        this.states = [];
        this.products = [];
        this.lines = [];

        $http.get('resources/data.json').then(function(response) {

            angular.extend(scope, response.data);

            scope.customers.sort(function(x, y) {
                return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
            });

            if (scope.products.length) {
                $rootScope.$broadcast('DataProvider.update');
            }

        });

        $http.get('resources/products.json').then(function(response) {
            angular.extend(scope.products, response.data);

            if (scope.lines.length) {
                $rootScope.$broadcast('DataProvider.update');
            }
        });
    });
}(angular));
