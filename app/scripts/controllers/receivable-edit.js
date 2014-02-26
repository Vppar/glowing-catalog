(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.edit.ctrl', []).controller(
            'ReceivableEditCtrl', function($scope,$filter, ReceivableService, OrderService, EntityService, DialogService) {
                
                $scope.updateReceivable = function(){
                    var receivable = angular.copy($scope.selectedReceivable);
                    var dialogPromise = DialogService.messageDialog({
                        title : 'Recebíveis',
                        message : 'Deseja confirmar alteração?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });

                    dialogPromise.then(function(){
                        ReceivableService.update($scope.removeArguments(receivable));
                        $scope.cancelEdit();
                    });
                };
                
                $scope.cancelEdit = function(){
                    $scope.selectedReceivable = null;
                    $scope.selectReceivableMode('list');  
                    $scope.$apply();
                };
                
            });
}(angular));