(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.pending.ctrl', []).controller('PurchaseOrderPendingProductsCtrl', [
        '$scope', 'PurchaseOrderService', function($scope, PurchaseOrderService) {

            // ############################################################################################################
            // Scope variables
            // ############################################################################################################

            $scope.watchedQty = {};
            $scope.pending.purchaseOrders = PurchaseOrderService.listPendingPurchaseOrders();
        }
    ]);
})(angular);