(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.active.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller('VoucherActiveCtrl', [
        '$scope', '$filter', 'ArrayUtils', function($scope, $filter, ArrayUtils) {

            $scope.copyVouchers = angular.copy($scope.vouchers);

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
                
                $scope.voucherFilter.date.setHours(23);
                $scope.voucherFilter.date.setMinutes(59);
                $scope.voucherFilter.date.setSeconds(59);
                
                var result = null;
                if (initialFilter) {
                    if (voucher.created <= initialFilter) {
                        if(voucher.redeemed){
                            if(voucher.redeemed>= initialFilter){
                                result = true;
                            }else{
                                result = false;
                            }
                        }else{
                            result = true;
                        }
                    }
                } else {
                    result = true;
                }
                
                return result;
            }

            $scope.filter = function filter() {
                var myFilter = $scope.voucherFilter.value;
                $scope.filteredVouchers = $filter('filter')($scope.copyVouchers, function(voucher) {
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
                $scope.filteredVouchers = summarizer();
                $scope.qtyTotal = $scope.filteredVouchers.length;
                $scope.priceTotal = $filter('sum')($scope.filteredVouchers, 'amount');
            };
            
            var summarizer = function(){
                var myVouchers = [];
                $scope.entityCounter = 0;
                for ( var ix in $scope.filteredVouchers) {
                    var entity = $scope.filteredVouchers[ix].entity;
                    var type = $scope.filteredVouchers[ix].type;

                    var result = ArrayUtils.list(myVouchers, 'entity', entity);
                    
                    if (result.length>0) {
                        var result = ArrayUtils.find(result, 'type', type);
                        if (result) {
                            result.amount = Number($scope.filteredVouchers[ix].amount) + Number(result.amount);
                        } else {
                            myVouchers.push(angular.copy($scope.filteredVouchers[ix]));
                        }
                    } else {
                        $scope.entityCounter++;
                        myVouchers.push(angular.copy($scope.filteredVouchers[ix]));
                    }
                }
                return myVouchers;
            };
            
            $scope.$watchCollection('voucherFilter', function() {
                $scope.filter();
            });

        }
    ]);
}(angular));