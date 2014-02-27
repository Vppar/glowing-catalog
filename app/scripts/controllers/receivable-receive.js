(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.receive.ctrl', []).controller(
            'ReceivableReceiveCtrl', function($scope, ReceivableService, DialogService) {

                $scope.comfirmLiquidate = function() {
                    var dialogPromise = DialogService.messageDialog({
                        title : 'Recebíveis',
                        message : 'Deseja liquidar recebível?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });

                    dialogPromise.then(function() {
                        var receivable = angular.copy($scope.selectedReceivable);
                        ReceivableService.receive(receivable.uuid, new Date());
                        $scope.selectedReceivable = null;
                        $scope.selectReceivableMode('list');
                    });

                };

                $scope.cancelPayment = function() {
                    $scope.selectedReceivable = null;
                    $scope.selectReceivableMode('list');
                };

            });
}(angular));