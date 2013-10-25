(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('PartialDeliveryCtrl', function($scope, $location, $filter, $dialog, DataProvider) {

        // #############################################################################################################
        // Scope variables and fuctions
        // #############################################################################################################
        $scope.order = {};
        $scope.openDeliveryDetails = function(item) {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.selectedItem = item;
            d.open('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl');
        };

        // #############################################################################################################
        // Local variables and methods.
        // #############################################################################################################
        // #############################################################################################################
        // Main method, controls the flow of this process.
        // #############################################################################################################
        function main() {
            var search = $location.search();
            var filteredOrders = $filter('filter')(DataProvider.orders, function(order) {
                return order.id === search.id;
            });

            // Like Connor MacLeod said once, "There can be only one!"
            $scope.order = filteredOrders[0];
        }
        main();
    });
}(angular));