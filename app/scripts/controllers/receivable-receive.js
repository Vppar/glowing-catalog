(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.receive.ctrl', []).controller(
            'ReceivableReceiveCtrl', function($scope, ReceivableService, DialogService) {

                $scope.comfirmReceive = function comfirmReceive() {
                    var receivable = angular.copy($scope.selectedReceivable);

                    if ($scope.isValid(receivable)) {
                        receiveReceivable(receivable);
                    } else {
                        invalidReceivable();
                    }
                };

                function receiveReceivable(receivable) {

                    DialogService.messageDialog({
                        title : 'Recebíveis',
                        message : 'Deseja liquidar recebível?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    }).then(function() {
                        var result = ReceivableService.receive(receivable.uuid, new Date().getTime());
                        
                        result.then(function() {
                            $scope.clearSelectedReceivable();
                        });
                    });
                }
                ;

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