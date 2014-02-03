(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.clients.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListClientsCtrl',
            function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider, ProductReturnService, ReceivableService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;

                $scope.ordersByCLientList = [];
                
                $scope.updateOrdersTotal = updateOrdersTotal;
                
                $scope.selectOrder = function selectOrder(consol) {
                    updateOrdersTotal(consol);
                };

                // add a missing property for innerJoin
                for ( var idx in entities) {
                    entities[idx].customerId = entities[idx].uuid;
                }
                function consolideteOrdersByClient() {
                    $scope.ordersByCLientList = [];
                    var joinClientOrder = ArrayUtils.innerJoin(entities, $scope.filteredOrders, 'customerId');
                    var distincsClients = ArrayUtils.distinct(joinClientOrder, 'customerId');
                    var client = {};

                    for ( var idx in distincsClients) {
                        // list all orders of one client.
                        var ordersByClient = ArrayUtils.filter(joinClientOrder, {
                            customerId : distincsClients[idx]
                        });
                        // use the first of array for common information
                        client = ordersByClient[0];
                        client.orders = [];
                        var totalAmount = 0;
                        var totalQuantity = 0;
                        var lastOrder = 1;

                        for ( var idy in ordersByClient) {
                            totalAmount += $filter('sum')(ordersByClient[idy].items, 'price', 'qty');
                            totalQuantity += $filter('sum')(ordersByClient[idy].items, 'qty');
                            client.orders.push(ordersByClient[idy].uuid);
                            if (ordersByClient[idy].created > lastOrder) {
                                lastOrder = ordersByClient[idy].created;
                            }
                        }

                        client.totalAmount = totalAmount;
                        client.totalQuantity = totalQuantity;
                        client.averagePrice = (totalAmount / totalQuantity);
                        client.lastOrder = new Date(lastOrder);
                        $scope.ordersByCLientList.push(client);
                    }
                }

                function updateOrdersTotal(consol) {
                    var filteredOrders = null;
                    if (consol) {
                        filteredOrders = [
                            consol
                        ];
                    } else {
                        filteredOrders = $scope.ordersByCLientList;
                    }
                    $scope.resetTotal();
                    for ( var ix in filteredOrders) {
                        var client = filteredOrders[ix];
                        for ( var ix in client.orders) {
                            var order = client.orders[ix];
                            var receivables = ReceivableService.listByDocument(order);
                            for ( var ix in receivables) {
                                var receivable = receivables[ix];
                                $scope.total[receivable.type].amount += receivable.amount;
                                $scope.total.all.amount += receivable.amount;

                                $scope.total[receivable.type].qty++;
                                $scope.total.all.qty++;
                            }
                            var exchangedProducts = ProductReturnService.listByDocument(order);
                            for ( var ix in exchangedProducts) {
                                var exchanged = exchangedProducts[ix];
                                $scope.total['exchange'].amount += (exchanged.cost * exchanged.quantity);
                                $scope.total.all.amount += exchanged.cost;
                                $scope.total['exchange'].qty += exchanged.quantity;
                            }

                        }

                    }
                }
                updateOrdersTotal();

                /**
                 * Watcher to filter the orders and populate the grid.
                 */
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    consolideteOrdersByClient();
                    updateOrdersTotal();
                });

            });
}(angular));