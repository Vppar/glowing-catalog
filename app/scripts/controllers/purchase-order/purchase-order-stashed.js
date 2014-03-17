(function(angular) {

    angular.module('tnt.catalog.purchase.stashed.ctrl', [
        'tnt.utils.array'
    ]).controller(
            'PurchaseOrderStashedCtrl',
            [
                '$scope', '$filter', '$q', '$log', 'NewPurchaseOrderService',
                function PurchseOrderStashedCtrl($scope, $filter, $q, $log, NewPurchaseOrderService) {

                    // ############################################################################################################
                    // Local variables
                    // ############################################################################################################

                    // ############################################################################################################
                    // Scope variables
                    // ############################################################################################################

                    $scope.stashedPurchaseOrders = NewPurchaseOrderService.listStashed();

                    // ############################################################################################################
                    // Scope functions
                    // ############################################################################################################

                    $scope.newPurchaseOrder = function() {
                        $scope.purchaseOrder.current = NewPurchaseOrderService.createNewCurrent();
                        $scope.selectTab('new');
                    };

                    $scope.openStashed = function(purchaseOrder) {
                        NewPurchaseOrderService.createNewCurrent(purchaseOrder);
                        $scope.selectTab('new');
                    };
                }
            ]);
})(angular);