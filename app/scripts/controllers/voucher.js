(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.ctrl', [
        'tnt.catalog.voucher.keeper',
    ]).controller(
            'VoucherCtrl',
            function($scope, $filter, VoucherKeeper) {
                /**
                 * The real deal
                 */
                var vouchers = VoucherKeeper.list('coupon');
                $scope.vouchers = vouchers;
                $scope.dates = {
                    dtInitial : '',
                    dtFinal : ''
                };

                $scope.filter = {
                    entity : '',
                    amount : ''
                };

                $scope.$watchCollection('filter', function() {
                    var gridFilter = {
                        entity : $scope.filter.entity,
                        amount : $scope.filter.amount
                    };

                    $scope.filteredVouchers = $filter('filter')($scope.vouchers, gridFilter);
                    var qtyTotal = 0;
                    var priceTotal = 0;
                    for ( var voucher in $scope.filteredVouchers) {
                        qtyTotal += $scope.filteredVouchers[voucher].qty;
                        $scope.filteredVouchers[voucher].priceTotal =
                                $scope.filteredVouchers[voucher].qty * $scope.filteredVouchers[voucher].amount;
                        priceTotal += $scope.filteredVouchers[voucher].priceTotal;
                        if ($scope.filteredVouchers[voucher].canceled) {
                            $scope.filteredVouchers[voucher].status = 'Disponivel';
                        } else if ($scope.filteredVouchers[voucher].redeemed === undefined) {
                            $scope.filteredVouchers[voucher].status = 'Cancelado';
                        } else {
                            $scope.filteredVouchers[voucher].status = $scope.filteredVouchers[voucher].redeemed;

                        }
                    }
                    $scope.qtyTotal = qtyTotal;
                    $scope.priceTotal = priceTotal;
                });

                $scope.filterVoucherByDate = function filterVoucher(voucher) {
                    var initialFilter = null;
                    var finalFilter = null;

                    if ($scope.dates.dtInitial !== '') {
                        if ($scope.dates.dtInitial) {
                            initialFilter = $scope.dates.dtInitial.getTime();
                        }
                    }
                    if ($scope.dates.dtFinal !== '') {
                        if ($scope.dates.dtFinal) {
                            finalFilter = $scope.dates.dtFinal.getTime();
                        }
                    }

                    if (initialFilter && finalFilter) {
                        // filter by two dates
                        if (voucher.created >= initialFilter && voucher.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else if (initialFilter) {
                        // filter by initial date
                        if (voucher.created >= initialFilter) {
                            return true;
                        }
                        return false;
                    } else if (finalFilter) {
                        // filter by final date
                        console.log(finalFilter);
                        if (voucher.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else {
                        // no filter
                        return true;
                    }
                };

            });
}(angular));
