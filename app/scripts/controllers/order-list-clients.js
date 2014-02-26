(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.clients.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListClientsCtrl',
            function($scope, $location, $filter, OrderService, ArrayUtils, ReceivableService, ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;
                var orders = $scope.orders;

                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredOrders = angular.copy(orders);
                $scope.filteredEntities = [];

                for ( var ix in orders) {
                    var order = orders[ix];
                    // Find the entity name
                    var entity = ArrayUtils.find(entities, 'uuid', order.customerId);
                    if (entity) {
                        order.entityName = entity.name;
                    } else {
                        order.entityName = '';
                    }

                    var qtyTotal = $filter('sum')(order.items, 'qty');
                    var priceTotal = $filter('sum')(order.items, 'price', 'qty');
                    var amountTotal = $filter('sum')(order.items, 'amount');

                    order.itemsQty = qtyTotal;
                    order.avgPrice = (priceTotal + amountTotal) / (qtyTotal);
                    order.amountTotal = priceTotal + amountTotal;
                }

                $scope.updateAndEnableHideOption = function(entity) {
                    updatePaymentsTotal(entity);
                    if ($scope.hideOptions === true) {
                        $scope.invertHideOption();
                    }
                };

                function updateFilteredEntities() {

                    $scope.filteredEntities.length = 0;

                    for ( var ix in entities) {
                        var entity = entities[ix];

                        var ordersByEntity = ArrayUtils.filter($scope.filteredOrders, {
                            customerId : entity.uuid
                        });

                        if (ordersByEntity.length > 0) {
                            var entityOrders = {
                                uuid : entity.uuid,
                                name : entity.name,
                                lastOrder : 0,
                                itemsQty : 0,
                                avgPrice : 0,
                                amountTotal : 0
                            };

                            for ( var ix2 in ordersByEntity) {
                                var order = ordersByEntity[ix2];

                                var lastOrder = entityOrders.lastOrder;

                                entityOrders.lastOrder = lastOrder > order.created ? lastOrder : order.created;
                                entityOrders.amountTotal += order.amountTotal;
                                entityOrders.itemsQty += order.itemsQty;
                            }
                            entityOrders.avgPrice = Math.round(100 * (entityOrders.amountTotal / entityOrders.itemsQty)) / 100;

                            $scope.filteredEntities.push(entityOrders);
                        }
                    }
                }

                function updatePaymentsTotal(entities) {
                    $scope.resetPaymentsTotal();

                    for ( var ix in entities) {
                        var entity = entities[ix];

                        var ordersByEntity = ArrayUtils.filter($scope.filteredOrders, {
                            customerId : entity.uuid
                        });

                        for ( var ix2 in ordersByEntity) {
                            var order = ordersByEntity[ix2];

                            var receivables = ReceivableService.listByDocument(order.uuid);
                            for ( var ix in receivables) {
                                var receivable = receivables[ix];
                                var amount = Number(receivable.amount);

                                $scope.total[receivable.type].amount += amount;
                                $scope.total[receivable.type].qty++;
                            }

                            var exchangedProducts = ProductReturnService.listByDocument(order.uuid);
                            for ( var ix in exchangedProducts) {
                                var exchanged = exchangedProducts[ix];
                                $scope.total['exchange'].amount += (exchanged.cost * exchanged.quantity);
                                $scope.total['exchange'].qty += Number(exchanged.quantity);
                            }

                            var vouchers = VoucherService.listByDocument(order.uuid);
                            for ( var idx in vouchers) {
                                var voucher = vouchers[idx];

                                var amount = Number(voucher.amount);

                                $scope.total.voucher.amount += amount;
                                $scope.total.voucher.qty += voucher.qty;
                            }
                        }
                    }
                }

                function updateOrdersTotal() {
                    $scope.resetOrdersTotal();

                    var entityMap = {};

                    var filteredOrders = $scope.filteredOrders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];

                        if (!entityMap[filteredOrder.customerId]) {
                            entityMap[filteredOrder.customerId] = filteredOrder.customerId;
                            $scope.total.all.entityCount++;
                        }

                        $scope.total.all.amount += filteredOrder.amountTotal;
                        $scope.total.all.qty += filteredOrder.itemsQty;

                        var lastOrder = $scope.total.all.lastOrder;

                        $scope.total.all.lastOrder = lastOrder > filteredOrder.created ? lastOrder : filteredOrder.created;
                        $scope.total.all.orderCount++;
                    }
                    
                    var avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                    if(!isNaN(avgPrice)){
                        $scope.total.all.avgPrice = avgPrice;
                    }else{
                        $scope.total.all.avgPrice = 0;
                    }
                }
                
                $scope.updateOrdersTotal = updateOrdersTotal;
                $scope.updatePaymentsTotal = updatePaymentsTotal;

                /**
                 * Watcher to filter the orders and populate the grid.
                 */
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filteredOrders = angular.copy($filter('filter')(orders, $scope.filterByDate));
                    updateOrdersTotal();
                    updatePaymentsTotal(entities);
                    updateFilteredEntities();
                    $scope.generateVA($scope.filteredEntities);
                });
            });
}(angular));