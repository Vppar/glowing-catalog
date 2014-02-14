(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.pending.ctrl', []).controller('ProductsToBuyPendingCtrl', function($scope, PurchaseOrderService) {

        $scope.watchedQty = {};
        
        $scope.pending = PurchaseOrderService.filterPending();
        
    });
}(angular));