(function(angular) {

    angular.module('tnt.catalog.purchase.stashed.ctrl', [
        'tnt.utils.array'
    ]).controller(
            'PurchaseOrderStashedCtrl',
            [
                '$scope', '$filter', '$q', '$log', 'NewPurchaseOrderService',
                function PurchseOrderStashedCtrl($scope, $filter, $q, $log, NewPurchaseOrderService) {

                    if (NewPurchaseOrderService.purchaseOrder) {
                        $scope.selectTab('new');
                    }

                    $scope.stashedPurchaseOrders = NewPurchaseOrderService.listStashed();

                    $scope.newPurchaseOrder = function() {
                        $scope.purchaseOrder.current = NewPurchaseOrderService.createNewCurrent();
                        $scope.selectTab('new');
                    };
                }
            ]);
})(angular);