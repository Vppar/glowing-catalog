(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.historic.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller(
            'VoucherHistoricCtrl', function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService, OrderService, EntityService) {

                var vouchers = angular.copy($scope.vouchers);

                $scope.vouchers = $filter('filter')(vouchers, function(voucher) {
                    return (voucher.canceled || voucher.redeemed);
                });
                var historicVouchers = angular.copy($scope.vouchers);

                /**
                 * Historic DateFilter
                 */
                function historicFilterVoucher(voucher) {
                    var initialFilter = null;
                    var finalFilter = null;

                    if ($scope.historicVoucher.dtInitial !== '') {
                        if ($scope.historicVoucher.dtInitial) {
                            initialFilter = $scope.historicVoucher.dtInitial.getTime();
                        }
                    }
                    if ($scope.historicVoucher.dtFinal !== '') {
                        if ($scope.historicVoucher.dtFinal) {
                            finalFilter = $scope.historicVoucher.dtFinal.getTime();
                        }
                    }
                    
                    if (initialFilter && finalFilter) {
                        if (voucher.created >= initialFilter && voucher.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else if (initialFilter) {
                        if (voucher.created >= initialFilter) {
                            return true;
                        }
                        return false;
                    } else if (finalFilter) {
                        if (voucher.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else {
                        return true;
                    }
                }

                $scope.$watchCollection('historicVoucher', function() {
                    var myFilter = $scope.historicVoucher.value;
                    $scope.filteredVouchers = $filter('filter')(historicVouchers, function(voucher) {
                        var result = true;
                        if ($scope.historicVoucher.value.length > 0) {
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
                    $scope.historicVouchers = $filter('filter')(historicVouchers, historicFilterVoucher);
                });
            });
}(angular));