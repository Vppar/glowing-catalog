(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'PartialDeliveryCtrl', function($scope, $location, $filter, $dialog, DataProvider, DialogService) {

                var dataProvider = DataProvider;

                // #############################################################################################################
                // Scope variables and functions
                // #############################################################################################################
                $scope.order = {};
                $scope.dataProvider = dataProvider;
                $scope.itemDeliveredAugmenter = function itemDeliveredAugmenter(item) {
                    var itemDeliveries = $filter('filter')(dataProvider.deliveries, function(delivery) {
                        return (delivery.orderId === $scope.order.id && delivery.item.id === item.id);
                    });
                    item.delivered = $filter('sum')(itemDeliveries, 'qty');
                    return true;
                };
                $scope.openDeliveryDetails = function(index) {
                    var d = $dialog.dialog({
                        backdropClick : true,
                        dialogClass : 'modal'
                    });
                    d.order = $scope.order;
                    d.selectedItemIdx = index;
                    d.open('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl');
                };

                // #############################################################################################################
                // Main method, controls the flow of this process.
                // #############################################################################################################
                function main() {
                    var search = $location.search();
                    var filteredOrders = $filter('filter')(dataProvider.orders, function(item) {
                        return item.id === search.id;
                    });
                    // Like Connor MacLeod said once, "There can be only one!"
                    $scope.order = filteredOrders[0];
                }
                main();

                /* DIALOG CUSTOMER INFO */
                $scope.openDialogCustomerInfo = DialogService.openDialogEditPass;
            });
}(angular));