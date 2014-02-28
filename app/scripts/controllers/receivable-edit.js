(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.edit.ctrl', []).controller(
            'ReceivableEditCtrl', function($scope, $filter, ReceivableService, DialogService) {

                $scope.comfirmUpdate = function() {
                    var receivable = angular.copy($scope.selectedReceivable);
                    if ($scope.isValid(receivable)) {
                        updateReceivable(receivable);
                    } else {
                        invalidReceivable();
                    }
                };

                function updateReceivable(receivable) {
                    var dialogPromise = DialogService.messageDialog({
                        title : 'Edição de Recebíveis',
                        message : 'Deseja confirmar alteração?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });

                    dialogPromise.then(function() {
                        var result = ReceivableService.update(receivable.uuid, receivable.remarks, receivable.duedate);
                        
                        result.then(function() {
                            $scope.clearSelectedReceivable();
                        });

                    });
                }

                function invalidReceivable() {
                    var dialogPromise = DialogService.messageDialog({
                        title : 'Edição de Recebível',
                        message : 'Valor inválido para liquidação',
                        btnYes : 'Ok',
                    });

                    dialogPromise.then(function() {
                        $scope.clearSelectedReceivable();
                    });
                }

                /**
                 * Verifies if a receivable is valid.
                 * 
                 * @returns boolean
                 */
                $scope.isValid = function isValid(receivable) {
                    var result = true;
                    if (angular.isDefined(receivable.amount) && receivable.amount <= 0) {
                        result = false;
                    }
                    return result;
                };

            });
}(angular));