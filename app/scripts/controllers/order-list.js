(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListCtrl', function($scope, $location, $filter, OrderService, DataProvider, ReceivableService) {

        // #############################################################################################################
        // Warming up the controller
        // #############################################################################################################

        var totalTemplate = {
            cash : {
                qty : 0,
                amount : 0
            },
            check : {
                qty : 0,
                amount : 0
            },
            creditCard : {
                qty : 0,
                amount : 0
            },
            noMerchantCc : {
                qty : 0,
                amount : 0
            },
            exchange : {
                qty : 0,
                amount : 0
            },
            voucher : {
                qty : 0,
                amount : 0
            },
            onCuff : {
                qty : 0,
                amount : 0
            },
            all : {
                qty : 0,
                amount : 0
            }
        };
        var hideOptions = true;

        $scope.orders = OrderService.list();
        $scope.entities = DataProvider.customers;

        //initialize dates
        var dtIni = new Date();
        dtIni.setMonth(dtIni.getMonth() - 1);
        $scope.dateFilter = {
            dtInitial : dtIni,
            dtFinal : new Date()
        };

        //Set first and last instants of dates.
        $scope.dateFilter.dtInitial.setHours(0);
        $scope.dateFilter.dtInitial.setMinutes(0);
        $scope.dateFilter.dtInitial.setSeconds(0);
        $scope.dateFilter.dtFinal.setHours(23);
        $scope.dateFilter.dtFinal.setMinutes(59);
        $scope.dateFilter.dtFinal.setSeconds(59);

        $scope.resetTotal = function() {
            $scope.total = angular.copy(totalTemplate);
        };
        $scope.resetTotal();

        $scope.invertHideOption = function() {
            $scope.hideOptions = !hideOptions;
            hideOptions = !hideOptions;
        };

        $scope.startHideOption = function() {
            $scope.hideOptions = hideOptions;
        };

        // #############################################################################################################
        // Local functions and variables
        // #############################################################################################################
        /**
         * DateFilter
         */
        $scope.filterByDate = function filterByDate(order) {
            var initialFilter = null;
            var finalFilter = null;
            if ($scope.dateFilter.dtInitial !== '') {
                if ($scope.dateFilter.dtInitial) {
                    initialFilter = $scope.dateFilter.dtInitial.getTime();
                }
            }
            if ($scope.dateFilter.dtFinal !== '') {
                if ($scope.dateFilter.dtFinal) {
                    finalFilter = $scope.dateFilter.dtFinal.getTime();
                }
            }

            if (initialFilter && finalFilter) {
                if (order.date >= initialFilter && order.date <= finalFilter) {
                    return true;
                }
                return false;
            } else if (initialFilter) {
                if (order.date >= initialFilter) {
                    return true;
                }
                return false;
            } else if (finalFilter) {
                if (order.date <= finalFilter) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };

    });
}(angular));
