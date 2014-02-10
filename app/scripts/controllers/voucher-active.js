(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.active.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller(
            'VoucherActiveCtrl', function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService, OrderService, EntityService) {

                var vouchers = angular.copy($scope.vouchers);

                /**
                 * The real deal
                 */
                var filteredVouchers = $filter('filter')(vouchers, function(voucher) {
                    return !(voucher.canceled || voucher.redeemed);
                });

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
                    $scope.filteredVouchers = $filter('filter')(filteredVouchers, function(voucher) {
                        var result = true;
                        if ($scope.voucherFilter.value.length > 0) {
                            result = false;

                            var type = '' + voucher.type;
                            var amount = '' + voucher.amount;
                            var entity = '' + voucher.entity;
                            
                            type = type.toLowerCase();
                            entity = entity.toLowerCase();
                            myFilter = myFilter.toLowerCase();

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