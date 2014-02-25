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

                $scope.notActiveVouchers = $filter('filter')(vouchers, function(voucher) {
                    return (voucher.canceled || voucher.redeemed);
                });


                $scope.isRedeemed = function (voucher) {
                    return !!voucher.redeemed;
                };

                /**
                 * Historic DateFilter
                 */
                function historicFilterVoucher(voucher) {
                    var initialFilter = null;
                    var finalFilter = null;
                    var isDateInitial = false;
                    var isDateFinal = false;
                    if ($scope.historicVoucher.dtInitial instanceof Date) {

                        $scope.historicVoucher.dtInitial.setHours(0);
                        $scope.historicVoucher.dtInitial.setMinutes(0);
                        $scope.historicVoucher.dtInitial.setSeconds(0);

                        initialFilter = $scope.historicVoucher.dtInitial.getTime();

                        isDateInitial = true;
                    }
                    if ($scope.historicVoucher.dtFinal instanceof Date) {

                        $scope.historicVoucher.dtFinal.setHours(23);
                        $scope.historicVoucher.dtFinal.setMinutes(59);
                        $scope.historicVoucher.dtFinal.setSeconds(59);

                        finalFilter = $scope.historicVoucher.dtFinal.getTime();

                        isDateFinal = true;
                    }

                    if (isDateInitial && isDateFinal) {
                        if ($scope.historicVoucher.dtInitial.getTime() > $scope.historicVoucher.dtFinal.getTime()) {
                            $scope.historicVoucher.dtFinal = angular.copy($scope.historicVoucher.dtInitial);
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

                $scope.filter = function filter() {
                    var myFilter = $scope.historicVoucher.value;
                    $scope.historicVouchers = $filter('filter')($scope.notActiveVouchers, function(voucher) {
                        var result = true;
                        if ($scope.historicVoucher.value.length > 0) {
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
                    $scope.historicVouchers = $filter('filter')($scope.historicVouchers, historicFilterVoucher);
                };

                $scope.$watchCollection('historicVoucher', function() {
                    $scope.filter();
                });
            });
}(angular));
