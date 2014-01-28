(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller('VoucherCtrl', function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService, OrderService, EntityService) {

        // FIXME - This mock must be removed when entity service is completed.
        EntityService.read = function() {
            return {
                name : 'Albert Einstein',
                id : 16
            };
        };

        /**
         * The real deal
         */

        $scope.vouchers = [];

        var vouchersList = VoucherKeeper.list('voucher');
        var couponList = VoucherKeeper.list('coupon');
        var giftList = VoucherKeeper.list('giftCard');

        for ( var ix in vouchersList) {
            vouchersList[ix].entity = EntityService.read(vouchersList[ix].entity).name;
            vouchersList[ix].type = 'Vale Crédito';
            $scope.vouchers.push(vouchersList[ix]);
        }
        for (ix in couponList) {
            couponList[ix].entity = EntityService.read(vouchersList[ix].entity).name;
            couponList[ix].type = 'Coupon';
            $scope.vouchers.push(couponList[ix]);
        }
        for (ix in giftList) {
            giftList[ix].entity = EntityService.read(vouchersList[ix].entity).name;
            giftList[ix].type = 'Vale Presente';
            $scope.vouchers.push(giftList[ix]);
        }

        // console.log($scope.vouchers);
        $scope.vouchers = $filter('filter')($scope.vouchers, function(voucher) {
            return !(voucher.canceled || voucher.redeemed);
        });

        $scope.voucherFilter = {
            value : '',
            date : ''
        };

        $scope.filteredVouchers = $scope.vouchers;

        /**
         * DateFilter
         */
        function filterVoucher(voucher) {
            var initialFilter = null;

            if ($scope.voucherFilter.date !== '') {
                if ($scope.voucherFilter.date) {
                    initialFilter = $scope.voucherFilter.date.getTime();
                }
            }
            if (initialFilter) {
                if (voucher.created >= initialFilter) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        }

        $scope.$watchCollection('voucherFilter', function() {
            var myFilter = $scope.voucherFilter.value;
            $scope.filteredVouchers = $filter('filter')($scope.vouchers, function(voucher) {
                var result = true;
                if ($scope.voucherFilter.value.length > 0) {
                    result = false;

                    var type = '' + voucher.type;
                    var amount = '' + voucher.amount;
                    var entity = '' + voucher.entity;

                    result = result || (type.indexOf(myFilter) > -1);
                    result = result || (amount.indexOf(myFilter) > -1);
                    result = result || (entity.indexOf(myFilter) > -1);
                }
                return result;
            });
            $scope.filteredVouchers = $filter('filter')($scope.filteredVouchers, filterVoucher);
            $scope.qtyTotal = $scope.filteredVouchers.length;
            $scope.priceTotal = $filter('sum')($scope.filteredVouchers, 'amount');
        });
    });
}(angular));