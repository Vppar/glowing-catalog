(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.confirm.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.purchaseOrder.service', 'tnt.catalog.purchase.service'
    ]).controller(
            'PurchaseOrderConfirmCtrl',
            [
                '$scope',
                '$log',
                '$q',
                'DialogService',
                'PurchaseOrderService',
                'NewPurchaseOrderService',
                function($scope, $log, $q, DialogService, PurchaseOrderService, NewPurchaseOrderService) {

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
                                    if (Number(item.qty) === 0) {
                                        line.items.splice(ix3, 1);
                                        NewPurchaseOrderService.purchaseOrder.remove(item);
                                    } else {
                                        ix3++;
                                        NewPurchaseOrderService.purchaseOrder.add(item);
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

                    // #####################################################################################################
                    // Scope variables
                    // #####################################################################################################

                    $scope.confirmedProducts = listConfirmedProducts(stockReport);

                    // #####################################################################################################
                    // Scope functions
                    // #####################################################################################################
                    $scope.cancel = function() {
                        var dialogPromise = DialogService.messageDialog({
                            title : 'Pedido de Compra',
                            message : 'Cancelar o pedido de compra?',
                            btnYes : 'Sim',
                            btnNo : 'Não'
                        });
                        var currentCanceledPromise = dialogPromise.then(NewPurchaseOrderService.cancelCurrent);
                        var canceledPromise = currentCanceledPromise.then(function() {
                            resetPurchaseOrder();
                            $scope.selectTab('stashed');
                        });
                        return canceledPromise;
                    };

                    $scope.save =
                            function() {
                                var dialogPromise = DialogService.messageDialog({
                                    title : 'Pedido de Compra',
                                    message : 'Salvar o pedido de compra?',
                                    btnYes : 'Sim',
                                    btnNo : 'Não'
                                });
                                var saveCurrentPromise =
                                        dialogPromise.then(function() {
                                            NewPurchaseOrderService.purchaseOrder.discount =
                                                    financialRound(summary.total.amount - summary.total.amountWithDiscount);
                                            NewPurchaseOrderService.purchaseOrder.freight = summary.freight;
                                            NewPurchaseOrderService.purchaseOrder.points = summary.total.points;

                                            return NewPurchaseOrderService.checkoutCurrent();
                                        });

                                var savedPromise = saveCurrentPromise.then(function() {
                                    resetPurchaseOrder();
                                    $scope.selectTab('stashed');
                                });

                                return savedPromise;
                            };

                    $scope.confirm =
                            function() {
                                var dialogPromise = DialogService.messageDialog({
                                    title : 'Pedido de Compra',
                                    message : 'Confirmar o pedido de compra?',
                                    btnYes : 'Sim',
                                    btnNo : 'Não'
                                });

                                var checkoutCurrentPromise =
                                        dialogPromise.then(function() {
                                            NewPurchaseOrderService.purchaseOrder.discount =
                                                    financialRound(summary.total.amount - summary.total.amountWithDiscount);
                                            NewPurchaseOrderService.purchaseOrder.freight = summary.freight;
                                            NewPurchaseOrderService.purchaseOrder.points = summary.total.points;

                                            return NewPurchaseOrderService.checkoutCurrent();
                                        });

                                var checkoutPromise = checkoutCurrentPromise.then(function() {
                                    resetPurchaseOrder();
                                    $scope.selectTab('stashed');
                                });

                                return checkoutPromise;
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
                }
            ]);
})(angular);
