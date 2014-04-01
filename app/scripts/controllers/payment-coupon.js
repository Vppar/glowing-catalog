(function (angular) {
    'use strict';

    angular.module(
        'tnt.catalog.payment.coupon',
        [
            'tnt.catalog.filter.findBy',
            'tnt.catalog.service.coupon',
            'tnt.catalog.service.dialog',
            'tnt.utils.array',
            'tnt.catalog.payment.service',
            'tnt.catalog.entity.service',
            'tnt.catalog.service.intent'
        ])
        .controller(
            'PaymentCouponCtrl',
            ['$filter', '$scope', '$log', 'CouponService', 'DialogService', 'ArrayUtils', 'OrderService', 'PaymentService', 'EntityService', 'IntentService',
            function ($filter, $scope, $log, CouponService, DialogService, ArrayUtils,
                OrderService, PaymentService, EntityService, IntentService) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################

                $scope.option = {};
                $scope.option.selected = 'option01';
                
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

                // Get already set voucher
                for ( var ix in order.items) {

                    if (!angular.isUndefined(order.items[ix].type) &&
                        order.items[ix].type == 'voucher') {
                        voucherSet = order.items[ix];
                        break;
                    }
                }

                if (voucherSet) {
                    $scope.voucher.total = voucherSet.amount;
                }

                // Checks if there's a voucher in the order
                function orderHasVoucher () {
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
                 * 
                 * @return {Boolean}
                 */
                function voucherIsEnabled () {
                    // The voucher screen is enabled either if there's a
                    // voucher in the order or if there's change.
                    return orderHasVoucher() || $scope.total.change > 0;
                }

                // Make the function available in the scope
                $scope.voucherIsEnabled = voucherIsEnabled;

                // Flag indicating if the confirm button is enabled or disabled
                // for the currently active option.
                $scope.confirmEnabled = false;

                // wachers
                $scope.$watch('selectedPaymentMethod', setCouponOption);

                $scope.$watch('voucher.total', canConfirm);
                $scope.$watch('gift.total', canConfirm);
                $scope.$watch('gift.customer.name', canConfirm);
                $scope.$watch('coupon.total', canConfirm);
                $scope.$watch('option.selected', canConfirm);

                function setCouponOption () {
                    if (!voucherIsEnabled()) {
                        if (!$scope.option.selected || $scope.option.selected === 'option01') {
                            $scope.option.selected = 'option02';
                        }
                    }
                }

                function canConfirm () {
                    switch ($scope.option.selected) {
                        case 'option01':
                            canConfirmVoucher();
                            break;
                        case 'option02':
                            canConfirmGift();
                            break;
                        case 'option03':
                            canConfirmCoupon();
                            break;
                        default:
                            $scope.confirmEnabled = false;
                    }
                }

                function canConfirmVoucher () {
                    $scope.confirmEnabled = orderHasVoucher() || $scope.voucher.total > 0;
                }

                function canConfirmCoupon () {
                    $scope.confirmEnabled =
                        PaymentService.hasPersistedCoupons() || $scope.coupon.total > 0;
                }

                function canConfirmGift () {
                    $scope.confirmEnabled =
                        !!$scope.gift.customer && !!$scope.gift.customer.name &&
                            $scope.gift.total > 0;
                }

                for ( var ix in $scope.list) {
                    $scope.$watch('list[' + ix + '].qty', updateTotal);
                }

                function updateTotal () {
                    $scope.coupon.total = 0;
                    $scope.qty = 0;
                    for ( var ix in $scope.list) {
                        $scope.list[ix].total = $scope.list[ix].qty * $scope.list[ix].amount;
                        $scope.qty += $scope.list[ix].qty;
                        $scope.coupon.total += $scope.list[ix].total;
                    }
                }

                $scope.selectConfirm = function selectConfirm () {
                    if ($scope.option.selected == 'option01') {
                        $scope.confirmVoucher();
                    } else if ($scope.option.selected == 'option02') {
                        $scope.confirmGift();
                    } else if ($scope.option.selected == 'option03') {
                        $scope.confirmCoupons();
                    }
                };

                $scope.calcCoupons = function calcCoupons () {
                    updateTotal();
                };

                $scope.confirmVoucher = function confirmVoucher () {

                    if (voucherSet) {
                        if ($scope.voucher.total == 0) {
                            order.items.splice(voucherSet.idx, 1);
                        } else {
                            voucherSet.amount = $scope.voucher.total;
                        }
                    } else {
                        // add a voucher to the order list
                        var idx = order.items.length;

                        var voucher = {
                            id : idx,
                            title : 'Vale Crédito',
                            entity : $scope.customer.uuid,
                            uniqueName : $scope.customer.name,
                            amount : $scope.voucher.total,
                            qty : 1,
                            type : 'voucher'
                        };
                        order.items.push(voucher);
                    }

                    $scope.selectPaymentMethod('none');
                };

                $scope.confirmGift = function confirmGift () {

                    // add a gift to the order list
                    var idx = order.items.length;

                    var gift = {
                        id : idx,
                        title : 'Vale Presente',
                        entity : $scope.gift.customer.uuid,
                        uniqueName : $scope.gift.customer.name,
                        amount : $scope.gift.total,
                        qty : 1,
                        type : 'giftCard'
                    };

                    order.items.push(gift);

                    $scope.selectPaymentMethod('none');
                };

                $scope.openDialogChooseCustomerGift = function () {
                    IntentService.putBundle({giftCard:'payment'});
                    DialogService.openDialogChooseCustomer().then(function (id) {
                        $scope.gift.customer = $filter('findBy')(EntityService.list(), 'uuid', id);
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

                    $scope.option.selected = option;
                };

                $scope.confirmCoupons = function confirmCoupons () {
                    // Persist coupons quantities in PaymentService
                    var coupon, len, i;
                    for (i = 0, len = $scope.list.length; i < len; i += 1) {
                        coupon = $scope.list[i];
                        PaymentService.persistCouponQuantity(coupon.amount, coupon.qty);
                    }

                    // Return to order overview
                    $scope.selectPaymentMethod('none');
                };
                
                var bundle = IntentService.getBundle();
                if(bundle && bundle.tab === 'giftCard'){
                    $('.active').removeClass('active'); //FIXME it does not unset active class in voucher tab with ng-class!!
                    $scope.selectOption('option02');
                    $scope.forceChangeUpdate();
                    $scope.gift.total = $scope.total.change;
                    if($scope.gift.total < 0){
                        $scope.gift.total = 0;
                    }
                    var customers = EntityService.list();
                    $scope.gift.customer = customers[customers.length-1];
                }
                
            }]);
}(angular));
