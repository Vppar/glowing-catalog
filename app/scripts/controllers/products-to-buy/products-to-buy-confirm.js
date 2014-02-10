(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.confirm.ctrl', [
        'tnt.catalog.service.dialog'
    ]).controller(
            'ProductsToBuyConfirmCtrl',
            function($scope, $log, DialogService) {

                // inherited from ProductsToBuyCtrl
                var listConfirmedProducts = function listConfirmedProducts(stockReport) {
                    var report = angular.copy(stockReport);
                    for ( var ix in report.sessions) {

                        var session = report.sessions[ix];

                        for ( var ix2 in session.lines) {
                            var line = session.lines[ix2];
                            for ( var ix3 = 0; ix3 < line.items.length;) {
                                var item = line.items[ix3];
                                if (item.qty === 0) {
                                    line.items.splice(ix3, 1);
                                } else {
                                    ix3++;
                                }
                            }
                            if (line.items.length === 0) {
                                delete session.lines[ix2];
                            }
                        }

                        var removeSession = true;
                        for (ix2 in session.lines) {
                            removeSession = false;
                            break;
                        }
                        if (removeSession) {
                            delete report.sessions[ix];
                        }
                    }
                    return report;
                };

                $scope.$on('updateConfirmed', function() {
                    // current time for log
                    var processStarted = new Date().getTime();

                    $scope.confirmedProducts = listConfirmedProducts($scope.stockReport);

                    var processDone = new Date().getTime();
                    $log.debug('ProductsToBuyConfirmCtrl.on(updateConfirmed): -It took ' + (processDone - processStarted) +
                        'ms to updateConfirmed list.');

                });

                $scope.cancel = function() {
                    var result = DialogService.messageDialog({
                        title : 'Pedido de Compra',
                        message : 'Cancelar o pedido de compra?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });
                    result.then(function(result) {
                        if (result) {
                            $scope.$emit('cancel');
                        }
                    });
                };

                $scope.confirm = function() {
                    var promise = DialogService.openDialogProductsToBuyConfirm();
                    promise.then(function(confirm) {
                        if (confirm) {
                            var result = DialogService.messageDialog({
                                title : 'Pedido de Compra',
                                message : 'Confirmar o pedido de compra?',
                                btnYes : 'Sim',
                                btnNo : 'Não'
                            });
                            result.then(function(result) {
                                if (result) {
                                    $scope.$emit('confirm');
                                }
                            });
                        }
                    });
                };

                this.listConfirmedProducts = listConfirmedProducts;
            });
}(angular));