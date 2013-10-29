(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'PartialDeliveryCtrl', function($scope, $location, $filter, $dialog, DataProvider, DialogService) {

                // #############################################################################################################
                // Scope variables and functions
                // #############################################################################################################
                $scope.order = {};
                $scope.dataProvider = DataProvider;
                $scope.partialDeliveryAugmenter = function partialDeliveryAugmenter(item) {
                    var scheduled = $filter('filter')(DataProvider.deliveries, function(delivery) {
                        return (delivery.orderId === $scope.order.id && delivery.status === 'scheduled');
                    });
                    var delivered = $filter('filter')(DataProvider.deliveries, function(delivery) {
                        return (delivery.orderId === $scope.order.id && delivery.status === 'delivered');
                    });
                    item.scheduled = $filter('sum')(itemScheduled, 'qty');
                    item.delivered = $filter('sum')(itemDelivered, 'qty');
                    item.remaining = item.qty - (item.scheduled + item.delivered);
                    return true;
                };
                $scope.orderDeliveriesFilter = function orderDeliveriesFilter(item) {
                    return Boolean(delivery.orderId === $scope.order.id);
                };
                $scope.openDeliveryDetails = function(delivery) {
                    $scope.order.selectedDelivery = delivery;
                    DialogService.openDialogDeliveryDetails({
                        order: $scope.order
                    });
                };
                
                 /*DIALOG CUSTOMER INFO*/
                $scope.openDialogCustomerInfo = function() {
                      var d = $dialog.dialog({
                          backdropClick : true,
                          dialogClass : 'modal'
                });
                      d.open('views/parts/partial-delivery/customer-info-dialog.html', 'CustomerInfoDialogCtrl');
                };

                // #############################################################################################################
                // Main method, controls the flow of this process.
                // #############################################################################################################
                function main() {
                    var search = $location.search();
                    var filteredOrders = $filter('filter')(DataProvider.orders, function(item) {
                        return item.id === search.id;
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
}(angular));