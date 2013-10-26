(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('DeliveryDetailsDialogCtrl', function($scope, dialog, DataProvider) {

        // #############################################################################################################
        // Local variables and functions
        // #############################################################################################################
        var delivery = {
            qty : 0
        };
        var order = dialog.order;
        var selectedItemIdx = dialog.selectedItemIdx;

        // #############################################################################################################
        // Scope variables and functions
        // #############################################################################################################

        $scope.delivery = delivery;
        $scope.order = order;
        $scope.item = order.items[selectedItemIdx];
        $scope.dataProvider = DataProvider;
        $scope.orderItemDeliveriesFilter = function orderItemDeliveriesFilter(delivery) {
            return delivery.orderId === $scope.order.id;
        };
        $scope.confirm = function(index) {
            if (delivery.qty <= 0) {
                // FIXME - Place a decent dialog here instead of this alert.
                alert('Não é possível fazer uma entrega sem itens.');
                return;
            }
            var item = order.items[selectedItemIdx];
            // Be careful this condition depends entirely on the premisse that
            // this screen will only open after the partial delivery screen.
            // There the order item is augmented with the delivered attribute.
            if ((delivery.qty + item.delivered) > item.qty) {
                // FIXME - Place a decent dialog here instead of this alert.
                alert('Não é possível fazer uma entrega com mais produtos do que solicitado na ordem.');
                return;
            }
            
            delivery.datetime = new Date();
            delivery.orderId = order.id;
            delivery.item = angular.copy(order.items[selectedItemIdx]);

            DataProvider.deliveries.push(angular.copy(delivery));

            delivery.qty = 0;

            dialog.close();
        };

        $scope.closeDialog = function() {
            dialog.close();
        };
    });
}(angular));