(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').service('DataProvider', function DataProvider($http) {

        var scope = this;

        $http.get('resources/data.json').then(function(response) {
            angular.extend(scope, response.data);

        });

        this.date = {};
        this.products = [];
        this.customers = [].sort(function(x, y) {
            return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
        });
        this.country = {};
        this.phone = {};
        this.cardData = {};
        this.orders = [];
        this.payments = [];
        this.currentPayments = {
            total : 0,
            checks : [],
            checksTotal : 0,
            creditCards : [],
            creditCardsTotal : 0
        };
        this.deliveries = [];
    });
}(angular));
