(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.summary.ctrl', [
        'tnt.catalog.purchase.service', 'tnt.catalog.service.dialog'
    ]).controller(
            'PurchaseOrderSummaryCtrl',
            [
                '$scope',
                '$filter',
                '$log',
                'DialogService',
                'NewPurchaseOrderService',
                function($scope, $filter, $log, DialogService, NewPurchaseOrderService) {

                    // #####################################################################################################
                    // Local variables
                    // #####################################################################################################

                    var financialRound = $scope.financialRound;
                    var resetPurchaseOrder = $scope.resetPurchaseOrder;

                    // if the order total is less then the amount use the fee.
                    var discounts = [
                        {
                            amount : 555,
                            fee : 0
                        }, {
                            amount : 890,
                            fee : 0.25
                        }, {
                            amount : 1410,
                            fee : 0.3
                        }, {
                            amount : 2460,
                            fee : 0.35
                        }, {
                            fee : 0.4
                        }
                    ];

                    $scope.summary.nextDiscount = {};

                    // #####################################################################################################
                    // Local Functions
                    // #####################################################################################################

                    function calculateDiscount() {
                        for ( var ix in discounts) {
                            var nix = Number(ix);
                            // if the order total is less then the amount use
                            // the
                            // fee.
                            if ($scope.summary.total.amount < discounts[nix].amount) {
                                var appliedFee = (1 - discounts[nix].fee);
                                $scope.summary.discount.fee = discounts[nix].fee * 100;
                                $scope.summary.total.amountWithDiscount = financialRound($scope.summary.total.amount * appliedFee);

                                $scope.summary.nextDiscount.amount = financialRound(discounts[nix].amount - $scope.summary.total.amount);
                                $scope.summary.nextDiscount.fee = 100 * (discounts[nix + 1].fee);

                                break;
                            } else if (!discounts[nix + 1]) {
                                var appliedFee = (1 - discounts[nix].fee);
                                $scope.summary.discount.fee = discounts[nix].fee * 100;
                                $scope.summary.total.amountWithDiscount = financialRound($scope.summary.total.amount * appliedFee);
                                $scope.summary.nextDiscount.amount = 0;
                                $scope.summary.nextDiscount.fee = discounts[discounts.length - 1].fee;
                            }
                        }

                    }

                    // #####################################################################################################
                    // Scope Functions
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
                                                    financialRound($scope.summary.total.amount - $scope.summary.total.amountWithDiscount);
                                            NewPurchaseOrderService.purchaseOrder.freight = $scope.summary.freight;
                                            NewPurchaseOrderService.purchaseOrder.points = $scope.summary.total.points;
                                            NewPurchaseOrderService.purchaseOrder.amount = $scope.summary.total.amount;

                                            return NewPurchaseOrderService.saveCurrent();
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
                                                    financialRound($scope.summary.total.amount - $scope.summary.total.amountWithDiscount);
                                            NewPurchaseOrderService.purchaseOrder.freight = $scope.summary.freight;
                                            NewPurchaseOrderService.purchaseOrder.points = $scope.summary.total.points;
                                            NewPurchaseOrderService.purchaseOrder.amount = $scope.summary.total.amount;

                                            return NewPurchaseOrderService.checkoutCurrent();
                                        });

                                var checkoutPromise = checkoutCurrentPromise.then(function() {
                                    resetPurchaseOrder();
                                    $scope.selectTab('stashed');
                                });

                                return checkoutPromise;
                            };

                    // #####################################################################################################
                    // Watchers
                    // #####################################################################################################

                    $scope.$watchCollection('summary.total.amount', function() {
                        calculateDiscount();
                    });
                }
            ]);
})(angular);