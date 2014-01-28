(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.payment.coupon', [
                'tnt.catalog.filter.findBy',
                'tnt.catalog.service.coupon',
                'tnt.catalog.service.dialog',
                'tnt.utils.array',
                'tnt.catalog.payment.service'
            ])
            .controller(
                    'PaymentCouponCtrl',
                    function($filter, $scope, $log, CouponService, DialogService, ArrayUtils, DataProvider, OrderService, PaymentService) {

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
                                qty : PaymentService.persistedCoupons[5] || 0,
                                amount : 5
                            }, {
                                qty : PaymentService.persistedCoupons[10] || 0,
                                amount : 10
                            }, {
                                qty : PaymentService.persistedCoupons[20] || 0,
                                amount : 20
                            }, {
                                qty : PaymentService.persistedCoupons[30] || 0,
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


                        // Checks if there's a voucher in the order
                        function orderHasVoucher() {
                            var len, i;
                            for (i = 0, len = order.items.length; i < len; i += 1) {
                                if (order.items[i].type === 'voucher') {
                                    return true;
                                }
                            }
                            return false;
                        }


                        /**
                         * Returns wether the voucher screen should be enabled or not.
                         * @return {Boolean}
                         */
                        function voucherIsEnabled() {
                          // The voucher screen is enabled either if there's a
                          // voucher in the order or if there's change.
                          return orderHasVoucher() || $scope.total.change > 0;
                        }

                        $scope.voucherIsEnabled = voucherIsEnabled;

                        // wachers
                        $scope.$watch('selectedPaymentMethod', setCouponOption);
                        $scope.$watch('voucher.total', canConfirmVoucher);
                        $scope.$watch('gift.total', canConfirmGift);
                        $scope.$watch('gift.customer.name', canConfirmGift);
                        $scope.$watch('coupon.total', canConfirmCoupon);
                        $scope.$watch('option', watchOptions);


                        function setCouponOption() {
                          if (!voucherIsEnabled()) {
                            if (!$scope.option || $scope.option === 'option01') {
                              $scope.option = 'option02';
                            }
                          }
                        }

                        function canConfirmVoucher() {
                            if ($scope.option === 'option01' && (orderHasVoucher() || $scope.voucher.total > 0)) {
                                $scope.isDisabled = false;
                            } else {
                                $scope.isDisabled = true;
                            }
                        }

                        function canConfirmCoupon() {
                            if ($scope.option === 'option03' && (PaymentService.hasPersistedCoupons() || $scope.coupon.total > 0)) {
                                $scope.isDisabled = false;
                            } else {
                                $scope.isDisabled = true;
                            }
                        }

                        function canConfirmGift() {
                            if (
                              $scope.option === 'option02' &&
                              $scope.gift.total > 0 &&
                              angular.isDefined($scope.gift.customer.name)
                            ) {
                                $scope.isDisabled = false;
                            } else {
                                $scope.isDisabled = true;
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
                                    id : idx,
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
                                id : idx,
                                title : 'Vale Presente',
                                uniqueName : $scope.gift.customer.name,
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


                        $scope.selectOption = function (option) {
                          if (option === 'option01' && !voucherIsEnabled()) {
                            DialogService.messageDialog({
                                title : 'Vale Crédito',
                                message : 'Não há troco para gerar um vale crédito.',
                                btnYes : 'OK'
                            });
                          
                            return;
                          }

                          $scope.option = option;
                        };


                        $scope.confirmCoupons = function confirmCoupons() {
                          // Persist coupons quantities in PaymentService
                          var coupon, len, i;
                          for (i = 0, len = $scope.list.length; i < len; i += 1) {
                            coupon = $scope.list[i];
                            PaymentService.persistCouponQuantity(coupon.amount, coupon.qty);
                          }

                          // Return to order overview
                          $scope.selectPaymentMethod('none');
                        };

                    });
}(angular));
