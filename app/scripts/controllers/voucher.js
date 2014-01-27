(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.ctrl', [
        'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array'
    ]).controller('VoucherCtrl', function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService) {
        /**
         * The real deal
         */
        var mockVoucher = [
            {
                id : 1,
                created : new Date(),
                amount : 123,
                type : 'Vale Crédito',
                entity : 'Mario'
            }, {
                id : 2,
                created : new Date(),
                amount : 3213,
                type : 'Vale Presente',
                entity : 'Joelma'
            }, {
                id : 3,
                created : new Date(),
                amount : 543,
                type : 'Coupon',
                entity : 'Ximbinha'
            }
        ];
        // $scope.vouchers = $filter('filter')(PaymentService.list('coupon'),
        // function(voucher) {
        // return voucher.canceled || voucher.redeemed;
        // });
        var vouchers = $filter('filter')(mockVoucher, function(voucher) {
            return !(voucher.canceled || voucher.redeemed);
        });

        $scope.voucherFilter = {
            value : '',
            date : ''
        };

        $scope.filteredVouchers = vouchers;

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
            $scope.filteredVouchers = $filter('filter')(vouchers, function(voucher) {
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
