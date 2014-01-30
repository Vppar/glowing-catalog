(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListCtrl', function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ReceivableService) {

        // FIXME - Mocks, created for test purposes while the
        // OrderService dosn't work.
        var entities = DataProvider.customers;
        // #############################################################################################################
        // Warming up the controller
        // #############################################################################################################

        var orders = OrderService.list();
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
        $scope.total = {};

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

        $scope.selectOrder = function selectOrder(order) {
            updateOrdersTotal(order);
        };

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

        function updateOrdersTotal(order) {
            var filteredOrders = null;
            if (order) {
                filteredOrders = [
                    order
                ];
            } else {
                filteredOrders = $scope.filteredOrders;
            }
            angular.extend($scope.total, totalTemplate);
            for ( var ix in filteredOrders) {
                var order = filteredOrders[ix];
                var receivables = ReceivableService.listByDocument(order.uuid);
                for ( var ix in receivables) {
                    var receivable = receivables[ix];
                    $scope.total[receivable.type].amount += receivable.amount;
                    $scope.total.all.amount += receivable.amount;

                    $scope.total[receivable.type].qty++;
                    $scope.total.all.qty++;
                }
            }
        }

        // #############################################################################################################
        // Watchers
        // #############################################################################################################

        /**
         * Watcher to filter the orders and populate the grid.
         */
        $scope.$watchCollection('dateFilter', function() {
            $scope.filteredOrders = angular.copy($filter('filter')(orders, filterByDate));
            updateOrdersTotal();
        });
    });
}(angular));