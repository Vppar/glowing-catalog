(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.confirm.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.purchaseOrder.service',
    ]).controller('ProductsToBuyConfirmCtrl', function($scope, $log, DialogService, PurchaseOrderService, PurchaseOrder, TimerService) {

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
            $scope.confirmedProducts = listConfirmedProducts($scope.stockReport);
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
            var confirmedPurchaseOrder = promise.then(confirmDialog);
            var persistedPurchaseOrder = confirmedPurchaseOrder.then(persitPurchaseOrder);
            persistedPurchaseOrder.then(function(result) {
                if (result) {
                    $scope.$emit('confirm');
                }
            });

        };
        function confirmDialog(confirm) {
            if (confirm) {
                var result = DialogService.messageDialog({
                    title : 'Pedido de Compra',
                    message : 'Confirmar o pedido de compra?',
                    btnYes : 'Sim',
                    btnNo : 'Não'
                });
                return result;
            }
        }
        function persitPurchaseOrder() {

            var orderBck = angular.copy($scope.confirmedProducts);

            var items = [];

            for ( var ix in orderBck.sessions) {
                // sessions
                var session = orderBck.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        items.push(item);
                    }
                }
            }
            var purchase = new PurchaseOrder(null, new Date(), false, items);
            PurchaseOrderService.register(purchase);

            return true;
        }

        $scope.shouldHideButtons = function() {
            var result = true;
            for ( var ix in $scope.confirmedProducts.sessions) {
                result = false;
                break;
            }
            return result;
        };

        this.listConfirmedProducts = listConfirmedProducts;
    });
}(angular));