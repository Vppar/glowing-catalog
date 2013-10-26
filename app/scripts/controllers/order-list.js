(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('OrderListCtrl', function($scope, $location, DataProvider) {

        // #############################################################################################################
        // Scope functions and variables
        // #############################################################################################################
        $scope.dataProvider = DataProvider;

        $scope.customerNameAugmenter = function customerNameAugmenter(order) {
            order.customerName = customers['_' + order.customerId].name;
            return order;
        };

        $scope.openPartialDelivery = function openPartialDelivery(order) {
            $location.path('/partial-delivery').search({
                id : order.id
            });
        };

        // #############################################################################################################
        // Local functions and variables
        // #############################################################################################################
        var customers = {};

        // #############################################################################################################
        // Main method, controls the flow of this process
        // #############################################################################################################
        function main() {
            // Easing the access to the customers by creating a map with _id.
            for ( var idx in DataProvider.customers) {
                customers['_' + DataProvider.customers[idx].id] = DataProvider.customers[idx];
            }

        }
        main();

    });
}(angular));