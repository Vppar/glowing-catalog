(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListCtrl', function($scope, $location, $filter, OrderService, ArrayUtils) {

        // FIXME - Mocks, created for test purposes while the
        // OrderService dosn't work.
        $scope.customers = [
            {
                id : 14,
                name : 'Valtanette De Paula'
            }
        ];
        // #############################################################################################################
        // Scope functions and variables
        // #############################################################################################################

        // FIXME - this should b the correct origin of the orders.
        $scope.orders = OrderService.list();

        $scope.filteredOrders = {};

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

        /**
         * Watcher to filter the orders and populate the grid.
         */
        $scope.$watchCollection('dateFilter', function() {
            console.log(OrderService.list());
            $scope.filteredOrders = $filter('filter')(angular.copy($scope.orders), filterByDate);
            for ( var ix in $scope.filteredOrders) {
                customerNameAugmenter($scope.filteredOrders[ix]);
                $scope.filteredOrders[ix].priceTotal = $filter('sum')($scope.filteredOrders[ix].items, 'price');
                var sumOfItems = $filter('sum')($scope.filteredOrders[ix].items, 'qty');
                $scope.filteredOrders[ix].avgPrice = ($scope.filteredOrders[ix].priceTotal) / (sumOfItems);
            }
        });

        // #############################################################################################################
        // Local functions and variables
        // #############################################################################################################

        /**
         * Find the customer name based on the customerId
         */
        function customerNameAugmenter(order) {
            order.customerName = ArrayUtils.find($scope.customers, 'id', order.customerId).name;
            return order;
        }

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