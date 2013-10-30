(function(angular, alert) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'PartialDeliveryCtrl', function($scope, $location, $filter, $dialog, DataProvider, DialogService) {

                // #############################################################################################################
                // Scope variables and functions
                // #############################################################################################################
                $scope.order = {};
                $scope.dataProvider = DataProvider;
                $scope.partialDeliveryAugmenter = function partialDeliveryAugmenter(orderItem) {
                    // Keep all deliveries of this order that has its status
                    // scheduled
                    var scheduled = $filter('filter')(DataProvider.deliveries, function(delivery) {
                        return (delivery.orderId === $scope.order.id && delivery.status === 'scheduled');
                    });
                    var delivered = $filter('filter')(DataProvider.deliveries, function(delivery) {
                        return (delivery.orderId === $scope.order.id && delivery.status === 'delivered');
                    });

                    var items = {};
                    var scheduledItems = [];
                    var deliveredItems = [];

                    var itemFilter = function itemFilter(item) {
                        return (item.id === orderItem.id);
                    };

                    // Get all delivery items that match to this one
                    for ( var idx in scheduled) {
                        items = $filter('filter')(scheduled[idx].items, itemFilter);
                        scheduledItems = scheduledItems.concat(items);
                    }
                    for (idx in delivered) {
                        items = $filter('filter')(delivered[idx].items, itemFilter);
                        deliveredItems = deliveredItems.concat(items);
                    }

                    orderItem.scheduled = $filter('sum')(scheduledItems, 'qty');
                    orderItem.delivered = $filter('sum')(deliveredItems, 'qty');
                    orderItem.remaining = orderItem.qty - (orderItem.scheduled + orderItem.delivered);
                    return true;
                };
                $scope.orderDeliveriesFilter = function orderDeliveriesFilter(delivery) {
                    return Boolean(delivery.orderId === $scope.order.id);
                };
                $scope.openDeliveryDetails = function(delivery) {
                    var remainingItems = $filter('filter')($scope.order.items, function(item) {
                        return item.remaining > 0;
                    });
                    if (remainingItems.length === 0 && delivery) {
                        alert('Não há mais items a serem entregues nesse pedido.');
                        return;
                    }
                    $scope.order.selectedDelivery = delivery;
                    DialogService.openDialogDeliveryDetails({
                        order : $scope.order
                    });
                };

                /* DIALOG CUSTOMER INFO */
                $scope.openDialogCustomerInfo = function() {
                    DialogService.openDialogCustomerInfo({
                        customer : $scope.order.customer
                    });
                };

                $scope.statusNameAugmenter = function statusNameAugmenter(delivery) {
                    var statusName = '';
                    if (delivery.status === 'scheduled') {
                        statusName = 'Agendado';
                    } else if (delivery.status === 'delivered') {
                        statusName = 'Entregue';
                    }
                    delivery.statusName = statusName;
                    return true;
                };

                // #############################################################################################################
                // Main method, controls the flow of this process.
                // #############################################################################################################
                function main() {
                    var search = $location.search();
                    var filteredOrders = $filter('filter')(DataProvider.orders, function(item) {
                        return item.id === Number(search.id);
                    });
                    // "There can be only one!" by Connor MacLeod
                    $scope.order = filteredOrders[0];

                    var filteredCustomers = $filter('filter')(DataProvider.customers, function(item) {
                        return item.id === $scope.order.customerId;
                    });
                    // "There can be only one!" by Connor MacLeod
                    $scope.order.customer = filteredCustomers[0];
                }
                main();
            });
}(angular, window.alert));