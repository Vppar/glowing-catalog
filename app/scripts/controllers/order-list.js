(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListCtrl', function($scope, $location, $filter, OrderService, EntityService, ReceivableService) {

        // #############################################################################################################
        // Warming up the controller
        // #############################################################################################################

        var paymentsTotalTemplate = {
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
            }
        };
        var ordersTotalTemplate = {
            all : {
                orderCount : 0,
                entityCount : 0,
                productCount : 0,
                stock : 0,
                qty : 0,
                avgPrice : 0,
                amount : 0,
                lastOrder : 0
            }
        };

        var hideOptions = true;

        // initialize dates
        // Set first and last instants of dates.
        var dtInitial = new Date();
        dtInitial.setHours(0);
        dtInitial.setMinutes(0);
        dtInitial.setSeconds(0);

        var dtFinal = new Date();
        dtFinal.setHours(23);
        dtFinal.setMinutes(59);
        dtFinal.setSeconds(59);

        $scope.total = {};
        $scope.orders = OrderService.list();
        $scope.entities = EntityService.list();

        $scope.dateFilter = {
            dtInitial : dtInitial,
            dtFinal : dtFinal
        };

        $scope.resetPaymentsTotal = function(resetOrders) {
            angular.extend($scope.total, angular.copy(paymentsTotalTemplate));
        };
        $scope.resetOrdersTotal = function(resetOrders) {
            angular.extend($scope.total, angular.copy(ordersTotalTemplate));
        };

        $scope.invertHideOption = function() {
            $scope.hideOptions = !hideOptions;
            hideOptions = !hideOptions;
        };
        
        $scope.startHideOption = function() {
            $scope.hideOptions = hideOptions;
        };

        $scope.resetPaymentsTotal();
        $scope.resetOrdersTotal();

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
                if (order.created >= initialFilter && order.created <= finalFilter) {
                    return true;
                }
                return false;
            } else if (initialFilter) {
                if (order.created >= initialFilter) {
                    return true;
                }
                return false;
            } else if (finalFilter) {
                if (order.created <= finalFilter) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };

    });
}(angular));
