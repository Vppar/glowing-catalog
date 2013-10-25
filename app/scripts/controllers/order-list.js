(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('OrderListCtrl', function($scope, DataProvider) {

        $scope.dataProvider = DataProvider;

        // Easing the access to the customers by creating a map with _id.
        var customers = {};
        for ( var idx in DataProvider.customers) {
            customers['_' + DataProvider.customers[idx].id] = DataProvider.customers[idx];
        }

        $scope.customerNameAugmenter = function customerNameAugmenter(order) {
            order.customerName = customers['_'+order.customerId].name;
            return order;
        };

    });
}(angular));