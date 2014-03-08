(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.confirm.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.purchaseOrder.service',
    ]).controller('ProductsToBuyConfirmCtrl', ['$scope', '$log', '$q', 'DialogService', 'PurchaseOrderService', function($scope, $log, $q, DialogService, PurchaseOrderService) {

        // #####################################################################################################
        // Local variables
        // #####################################################################################################

        // inherited object
        var stockReport = $scope.main.stockReport;
        var summary = $scope.summary;

        // inherited functions
        var financialRound = $scope.financialRound;
        var resetPurchaseOrder = $scope.resetPurchaseOrder;

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        // inherited from ProductsToBuyCtrl
        var listConfirmedProducts = function listConfirmedProducts(stockReport) {
            var report = angular.copy(stockReport);
            for ( var ix in report.sessions) {

                var session = report.sessions[ix];

                for ( var ix2 in session.lines) {
                    var line = session.lines[ix2];
                    for ( var ix3 = 0; ix3 < line.items.length;) {
                        var item = line.items[ix3];
                        item.qty = $scope.purchaseOrder.watchedQty[item.id];
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

            var purchase = {
                uuid : null,
                amount : summary.total.amount,
                discount : financialRound(summary.total.amount - summary.total.amountWithDiscount),
                freight : summary.freight,
                points : summary.total.points,
                items : items
            };

            return PurchaseOrderService.register(purchase);
        }

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        $scope.confirmedProducts = listConfirmedProducts(stockReport);

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        $scope.cancel = function() {
            var result = DialogService.messageDialog({
                title : 'Pedido de Compra',
                message : 'Cancelar o pedido de compra?',
                btnYes : 'Sim',
                btnNo : 'Não'
            });
            result.then(function(result) {
                if (result) {
                    $scope.selectTab('buildOrder');
                    resetPurchaseOrder();
                }
            });
        };

        $scope.confirm = function() {
            var confirmedPurchaseOrder = DialogService.messageDialog({
                title : 'Pedido de Compra',
                message : 'Confirmar o pedido de compra?',
                btnYes : 'Sim',
                btnNo : 'Não'
            });
            var persistedPurchaseOrder = confirmedPurchaseOrder.then(function(result) {
                if (result) {
                    return persitPurchaseOrder();
                }
            });
            persistedPurchaseOrder.then(function(result) {
                if (result) {
                    $scope.selectTab('verifyTicket');
                    resetPurchaseOrder();
                }
            });

        };

        $scope.shouldHideButtons = function() {
            var result = true;
            for ( var ix in $scope.confirmedProducts.sessions) {
                result = false;
                break;
            }
            return result;
        };

        // #####################################################################################################
        // Publishing methods to be tested
        // #####################################################################################################

        this.listConfirmedProducts = listConfirmedProducts;
    }]);
}(angular));
