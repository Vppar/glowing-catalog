(function (angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.summary.ctrl', [
        'tnt.catalog.purchase.service', 'tnt.catalog.service.dialog'
    ]).controller(
        'PurchaseOrderSummaryCtrl',
        [
            '$scope',
            '$q',
            '$filter',
            '$log',
            'DialogService',
            'NewPurchaseOrderService',
            function ($scope, $q, $filter, $log, DialogService, NewPurchaseOrderService) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                var financialRound = $scope.financialRound;
                var resetPurchaseOrder = $scope.resetPurchaseOrder;
                var stockReport = $scope.main.stockReport;

                // if the order total is less then the amount use the fee.
                var discounts = [
                    {
                        amount: 555,
                        fee: 0
                    },
                    {
                        amount: 890,
                        fee: 0.25
                    },
                    {
                        amount: 1410,
                        fee: 0.3
                    },
                    {
                        amount: 2460,
                        fee: 0.35
                    },
                    {
                        fee: 0.4
                    }
                ];

                var hasCurrentPurchaseOrder = $scope.hasCurrentPurchaseOrder;
                var selectTab = $scope.selectTab;

                // FIXME - Relocate from this session
                $scope.summary.nextDiscount = {};

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                function calculateDiscount() {
                    for (var ix in discounts) {
                        var nix = Number(ix);
                        // if the order total is less then the amount use
                        // the
                        // fee.
                        var appliedFee = null;
                        if ($scope.summary.total.amount < discounts[nix].amount) {
                            appliedFee = (1 - discounts[nix].fee);
                            $scope.summary.discount.fee = discounts[nix].fee * 100;
                            $scope.summary.total.amountWithDiscount = financialRound($scope.summary.total.amount * appliedFee);

                            $scope.summary.nextDiscount.amount = financialRound(discounts[nix].amount - $scope.summary.total.amount);
                            $scope.summary.nextDiscount.fee = 100 * (discounts[nix + 1].fee);

                            break;
                        } else if (!discounts[nix + 1]) {
                            appliedFee = (1 - discounts[nix].fee);
                            $scope.summary.discount.fee = discounts[nix].fee * 100;
                            $scope.summary.total.amountWithDiscount = financialRound($scope.summary.total.amount * appliedFee);
                            $scope.summary.nextDiscount.amount = 0;
                            $scope.summary.nextDiscount.fee = discounts[discounts.length - 1].fee;
                        }
                    }

                }

                function backToStashed() {
                    resetPurchaseOrder();
                    selectTab('stashed');
                }

                function backToNew() {
                    resetPurchaseOrder();
                    selectTab('new');
                }

                $scope.goToConfirm = function goToConfirm() {
                    $scope.save().then(function () {
                        selectTab('confirm');
                    });
                };

                function goToTicket() {
                    resetPurchaseOrder();
                    selectTab('ticket');
                }

                // #####################################################################################################
                // Scope Functions
                // #####################################################################################################

                $scope.back = function () {
                    var backPromise = null;
                    if (hasCurrentPurchaseOrder() && NewPurchaseOrderService.purchaseOrder.isDirty) {
                        backPromise = DialogService.messageDialog({
                            title: 'Pedido de Compra',
                            message: 'Existem alterações que não foram salvas. Deseja descartá-las?',
                            btnYes: 'Descartar',
                            btnNo: 'Voltar'
                        }).then(NewPurchaseOrderService.clearCurrent);
                    } else {
                        var deferred = $q.defer();
                        backPromise = deferred.promise.then(NewPurchaseOrderService.clearCurrent);

                        deferred.resolve('backToStashed');
                    }

                    return backPromise.then(backToStashed);
                };

                $scope.cancel = function () {
                    backToNew();
                };

                $scope.save =
                    function () {
                        NewPurchaseOrderService.purchaseOrder.discount =
                            financialRound($scope.summary.total.amount - $scope.summary.total.amountWithDiscount);
                        NewPurchaseOrderService.purchaseOrder.freight = $scope.summary.freight;
                        NewPurchaseOrderService.purchaseOrder.points = $scope.summary.total.points;
                        NewPurchaseOrderService.purchaseOrder.amount = $scope.summary.total.amount;
                        NewPurchaseOrderService.calculateCost($scope.summary.total.amountWithDiscount);

                        return NewPurchaseOrderService.saveCurrent();
                    };

                $scope.confirm =
                    function () {
                        var dialogPromise = DialogService.messageDialog({
                            title: 'Pedido de Compra',
                            message: 'Confirmar o pedido de compra?',
                            btnYes: 'Sim',
                            btnNo: 'Não'
                        });

                        var checkoutCurrentPromise =
                            dialogPromise.then(function () {
                                NewPurchaseOrderService.purchaseOrder.discount =
                                    financialRound($scope.summary.total.amount - $scope.summary.total.amountWithDiscount);
                                NewPurchaseOrderService.purchaseOrder.freight = $scope.summary.freight;
                                NewPurchaseOrderService.purchaseOrder.points = $scope.summary.total.points;
                                NewPurchaseOrderService.purchaseOrder.amount = $scope.summary.total.amount;
                                NewPurchaseOrderService.calculateCost($scope.summary.total.amountWithDiscount);
                                return NewPurchaseOrderService.checkoutCurrent();
                            });

                        var checkoutPromise = checkoutCurrentPromise.then(goToTicket);

                        return checkoutPromise;
                    };

                $scope.hasItems = function () {
                    return $scope.summary.total.amount > 0;
                };

                // #####################################################################################################
                // Watchers
                // #####################################################################################################

                $scope.$watchCollection('summary.total.amount', function () {
                    calculateDiscount();
                });
            }
        ]);
})(angular);
