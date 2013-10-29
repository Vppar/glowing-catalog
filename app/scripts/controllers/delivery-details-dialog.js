(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('DeliveryDetailsDialogCtrl', function($scope, $filter, dialog, DataProvider) {

        // #############################################################################################################
        // Local variables and functions
        // #############################################################################################################
        var delivery = {
            items : []
        };
        var order = dialog.data.order;

        var orderItemDeliveriesFilter = function orderItemDeliveriesFilter(delivery) {
            return delivery.orderId === $scope.order.id;
        };

        // #############################################################################################################
        // Scope variables and functions
        // #############################################################################################################

        $scope.order = order;
        $scope.item = {
            qty : 0
        };
        $scope.delivery = delivery;

        $scope.addToDelivery = function(item) {
            var filteredItems = $filter('filter')(delivery.items, function(product) {
                return Boolean(product.id === Number(item.id));
            });

            if (filteredItems.length === 0) {
                var filteredProducts = $filter('filter')(DataProvider.products, function(product) {
                    return Boolean(product.id === Number(item.id));
                });
                var deliveryItem = filteredProducts[0];
                deliveryItem.qty = item.qty;
                delivery.items.push(angular.copy(deliveryItem));

                delete item.qty;
            }
        };

        $scope.removeFromDelivery = function(index) {
            delivery.items.splice(index, 1);
        };

        $scope.cancel = function() {
            dialog.close();
        };
        $scope.save = function() {
            dialog.close();
        };

        $scope.deliver = function() {
            if (delivery.items.length <= 0) {
                // FIXME - Place a decent dialog here instead of this alert.
                alert('Não é possível fazer uma entrega sem itens.');
                return;
            }
            
            delivery.id = DataProvider.deliveries.length + 1;
            delivery.datetime = new Date();
            delivery.orderId = order.id;
            delivery.statys = 'delivered';
            delivery.items = angular.copy(delivery.items);

            DataProvider.deliveries.push(angular.copy(delivery));

            delivery.qty = 0;

            dialog.close();
        };

        function updateTime() {
            delivery.datetime = new Date();
            delivery.time = $filter('date')(delivery.datetime, 'HH:mm:ss');
        }

        function main() {
            var deliveries = $filter('filter')(DataProvider.deliveries, orderItemDeliveriesFilter);
            delivery.items = deliveries;

            updateTime();
        }
        main();
    });
}(angular));