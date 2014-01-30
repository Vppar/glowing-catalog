(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListCtrl', function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider) {

        // FIXME - Mocks, created for test purposes while the
        // OrderService dosn't work.
        var entities = DataProvider.customers;
        // #############################################################################################################
        // Warming up the controller
        // #############################################################################################################

        var orders = OrderService.list();

        $scope.filteredOrders = angular.copy(orders);
        $scope.dateFilter = {
            dtInitial : '',
            dtFinal : ''
        };

        /**
         * Opens partial delivery Screen
         */
        $scope.openPartialDelivery = function openPartialDelivery(order) {
            $location.path('/partial-delivery').search({
                id : order.id
            });
        };
        console.log(orders);
        for ( var ix in orders) {
            var order = orders[ix];
            console.log(order);
            // Find the entity name
            order.entityName = ArrayUtils.find(entities, 'id', order.customerId).name;
            // Calc the
            var qtyTotal = $filter('sum')(order.items, 'qty');
            order.amountTotal = $filter('sum')(order.items, 'price', 'qty');
            order.avgPrice = (order.amountTotal) / (qtyTotal);
        }

        // #############################################################################################################
        // Watchers
        // #############################################################################################################

        /**
         * Watcher to filter the orders and populate the grid.
         */
        $scope.$watchCollection('dateFilter', function() {
            $scope.filteredOrders = angular.copy($filter('filter')(orders, filterByDate));
        });

        // #############################################################################################################
        // Local functions and variables
        // #############################################################################################################
        /**
         * DateFilter
         */
        function filterByDate(order) {
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
        }
    });
}(angular));