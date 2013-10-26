(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('DeliveryDetailsDialogCtrl', function($scope, dialog, DataProvider) {
        // #############################################################################################################
        // Local variables and functions
        // #############################################################################################################
        var delivery = {};
        var order = dialog.order;
        var selectedItemIdx = dialog.selectedItemIdx;

        // #############################################################################################################
        // Scope variables and functions
        // #############################################################################################################

        $scope.delivery = delivery;
        $scope.order = order;
        $scope.selectedItemIdx = selectedItemIdx;
        $scope.dataProvider = DataProvider;
        $scope.orderItemDeliveriesFilter = function orderItemDeliveriesFilter(delivery) {
            return delivery.orderId === $scope.order.id;
        };
        $scope.addToDeliveries = function(index) {
            delivery.id = DataProvider.deliveries.length + 1;
            delivery.datetime = new Date();
            delivery.orderId = order.id;
            delivery.item = angular.copy(order.items[selectedItemIdx]);

            DataProvider.deliveries.push(angular.copy(delivery));

            delivery.qty = 0;
        };

        $scope.closeDialog = function() {
            dialog.close();
        };

        function main() {
            delivery.qty = 0;
        }
        main();
    });
}(angular));