(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.edit.ctrl', []).controller(
            'ReceivableEditCtrl', function($scope,$filter, ReceivableService, OrderService, EntityService) {
                
                $scope.updateReceivable = function(receivable){
                    ReceivableService.update(receivable);
                };
                
            });
}(angular));