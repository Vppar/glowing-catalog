(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.payment.coupon', [
                'tnt.catalog.filter.findBy', 'tnt.catalog.service.coupon', 'tnt.catalog.service.dialog', 'tnt.utils.array'
            ])
            .controller(
                    'PaymentCouponCtrl',
                    function($filter, $scope, $log, CouponService, DialogService, ArrayUtils, DataProvider, OrderService) {

                        // #####################################################################################################
                        // Warm up the controller
                        // #####################################################################################################
                        var errorMessage =
                                'Ocorreram erros na geração dos cupons. Na próxima sincronização do sistema um administrador será acionado.';
                        var oneCouponMessage =
                                'Foi gerado 1 cupom promocional no total de R$ {{coupomsValue}} para o cliente {{customerFirstName}}.';
                        var moreThanOneCouponMessage =
                                'Foram gerados {{couponNumber}} cupons promocionais no total de R$ {{couponsValue}} para o cliente {{customerFirstName}}.';

                        var order = OrderService.order;

                        var voucherSet = null;

                        $scope.qty = 0;
                        $scope.voucher = {
                            total : 0
                        };

                        $scope.coupon = {
                            total : 0
                        };

                        $scope.gift = {
                            total : 0,
                            customer : ''
                        };

                        if ($scope.total.change > 0) {
                            $scope.voucher.total = $scope.total.change;
                            $scope.gift.total = $scope.total.change;
                        } else {
                            $scope.voucher.total = 0;
                            $scope.gift.total = 0;
                        }

                        $scope.list = [
                            {
                                qty : 0,
                                amount : 5
                            }, {
                                qty : 0,
                                amount : 10
                            }, {
                                qty : 0,
                                amount : 20
                            }, {
                                qty : 0,
                                amount : 30
                            },
                        ];

                        $scope.isDisabled = true;

                        // Get already set voucher
                        for ( var ix in order.items) {
                            if (!angular.isUndefined(order.items[ix].type) && order.items[ix].type == 'voucher') {
                                voucherSet = order.items[ix];
                                break;
                            }
                        }

                        if (voucherSet) {
                            $scope.voucher.total = voucherSet.price;
                        }

                        // wachers

                        $scope.$watch('voucher.total', canConfirmVoucher);
                        $scope.$watch('gift.total', canConfirmGift);
                        $scope.$watch('gift.customer.name', canConfirmGift);
                        $scope.$watch('coupon.total', canConfirmCoupon);
                        $scope.$watch('option', watchOptions);

                        function canConfirmVoucher() {
                            if ($scope.voucher.total > 0) {
                                $scope.isDisabled = false;
                            }
                        }

                        function canConfirmCoupon() {
                            if ($scope.coupon.total > 0) {
                                $scope.isDisabled = false;
                            }
                        }

                        function canConfirmGift() {
                            if ($scope.gift.total > 0 && angular.isDefined($scope.gift.customer.name)) {
                                $scope.isDisabled = false;
                            }
                        }

                        function watchOptions() {
                            $scope.isDisabled = true;

                            if ($scope.option === 'option01') {
                                canConfirmVoucher();
                            } else if ($scope.option === 'option02') {
                                canConfirmGift();
                            } else if ($scope.option === 'option03') {
                                canConfirmCoupon();
                            }

                        }

                        for ( var ix in $scope.list) {
                            $scope.$watch('list[' + ix + '].qty', updateTotal);
                        }

                        function updateTotal() {
                            $scope.coupon.total = 0;
                            $scope.qty = 0;
                            for ( var ix in $scope.list) {
                                $scope.list[ix].total = $scope.list[ix].qty * $scope.list[ix].amount;
                                $scope.qty += $scope.list[ix].qty;
                                $scope.coupon.total += $scope.list[ix].total;
                            }
                        }

                        $scope.selectConfirm = function selectConfirm() {
                            if ($scope.option == 'option01') {
                                $scope.confirmVoucher();
                            } else if ($scope.option == 'option02') {
                                $scope.confirmGift();
                            } else if ($scope.option == 'option03') {
                                $scope.confirmCoupons();
                            }
                        };

                        $scope.calcCoupons = function calcCoupons() {
                            updateTotal();
                        };

                        $scope.confirmVoucher = function confirmVoucher() {

                            if (voucherSet) {
                                if ($scope.voucher.total == 0) {
                                    order.items.splice(voucherSet.idx, 1);
                                } else {
                                    voucherSet.price = $scope.voucher.total;
                                }
                            } else {
                                // add a voucher to the order list
                                var idx = order.items.length;

                                var voucher = {
                                    idx : idx,
                                    title : 'Vale Crédito',
                                    uniqueName : $scope.customer.name,
                                    price : $scope.voucher.total,
                                    qty : 1,
                                    type : 'voucher'
                                };
                                order.items.push(voucher);
                            }

                            $scope.selectPaymentMethod('none');
                        };

                        $scope.confirmGift = function confirmGift() {

                            // add a gift to the order list
                            var idx = order.items.length;

                            var gift = {
                                idx : idx,
                                title : 'Vale Presente',
                                price : $scope.coupon.total,
                                uniqueName : 'para ' + $scope.gift.customer.name,
                                price : $scope.gift.total,
                                qty : 1,
                                type : 'giftCard'
                            };

                            order.items.push(gift);

                            $scope.selectPaymentMethod('none');
                        };

                        $scope.openDialogChooseCustomerGift = function() {
                            DialogService.openDialogChooseCustomer().then(function(id) {
                                $scope.gift.customer = $filter('findBy')(DataProvider.customers, 'id', id);
                            });
                        };

                        $scope.confirmCoupons =
                                function confirmCoupons() {
                                    var entityId = $scope.customer.id;
                                    var generatedCupons = [];
                                    for ( var idx in $scope.list) {
                                        var item = $scope.list[idx];
                                        if (item.qty > 0) {
                                            // creates all requested coupons
                                            // with same amount.
                                            for ( var i = 0; i < item.qty; i++) {
                                                try {
                                                    CouponService.create(entityId, item.amount);
                                                    generatedCupons.push(item);
                                                } catch (err) {
                                                    DialogService.messageDialog({
                                                        title : 'Cupom Promocional',
                                                        message : errorMessage,
                                                        btnYes : 'OK'
                                                    });
                                                    $log.fatal(new Date() + ' - There were problems in creating coupons. \n client ID:' +
                                                        entityId + '\n' + 'Cupons to insert:' + JSON.stringify($scope.list) + '\n' +
                                                        'Cupons inserted:' + JSON.stringify(generatedCupons));
                                                    // TODO keep track in
                                                    // journal?
                                                } finally {

                                                    generatedCupons.clear;
                                                    $scope.selectPaymentMethod('none');
                                                }
                                            }
                                        }
                                    }
                                    if ($scope.qty > 0) {
                                        var sucessMsg = '';
                                        var total = $filter('currency')($scope.coupon.total, '');
                                        if ($scope.qty === 1) {
                                            sucessMsg =
                                                    oneCouponMessage.replace('{{couponsValue}}', total).replace(
                                                            '{{customerFirstName}}', $scope.customer.name);
                                        } else {
                                            sucessMsg =
                                                    moreThanOneCouponMessage.replace('{{couponNumber}}', $scope.qty).replace(
                                                            '{{couponsValue}}', total).replace(
                                                            '{{customerFirstName}}', $scope.customer.name);

                                        }
                                        DialogService.messageDialog({
                                            title : 'Cupom Promocional',
                                            message : sucessMsg,
                                            btnYes : 'OK'
                                        });
                                    }
                                    $scope.selectPaymentMethod('none');
                                };
                    });
}(angular));
