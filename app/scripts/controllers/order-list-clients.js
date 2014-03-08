(function (angular) {
    'use strict';
    angular
        .module('tnt.catalog.orderList.clients.ctrl', [
            'tnt.catalog.order.service', 'tnt.utils.array'
        ])
        .controller(
            'OrderListClientsCtrl',
            [
                '$scope',
                '$location',
                '$filter',
                'OrderService',
                'ArrayUtils',
                'ReceivableService',
                'ProductReturnService',
                'VoucherService',
                function ($scope, $location, $filter, OrderService, ArrayUtils, ReceivableService,
                    ProductReturnService, VoucherService) {

                    // $scope.entities come from OrderListCtrl
                    var customers = $scope.customers;
                    // $scope.filteredOrders come from OrderListCtrl
                    $scope.filteredEntities = [];
                    $scope.checkedEntityUUID = null;
                    $scope.filterOrders($scope.orders);
                    $scope.updateAndEnableHideOption = function (entity) {
                        $scope.checkedEntityUUID = entity.entityId;
                        $scope.updatePaymentsTotal([
                            entity
                        ]);
                        if ($scope.hideOptions === true) {
                            $scope.invertHideOption();
                        }
                    };

                    $scope.callUpdateReceivableTotal = function (entities) {
                        $scope.checkedEntityUUID = null;
                        $scope.updatePaymentsTotal(entities);
                    };

                    function updateFilteredEntities () {
                        $scope.filteredEntities.length = 0;

                        for ( var ix in customers) {
                            var entity = customers[ix];
                            var ordersByEntity = ArrayUtils.filter($scope.filteredOrders, {
                                customerId : entity.uuid
                            });

                            if (ordersByEntity.length > 0) {
                                var entityOrders = {
                                    entityId : entity.uuid,
                                    name : entity.name,
                                    lastOrder : 0,
                                    itemsQty : 0,
                                    avgPrice : 0,
                                    amountTotal : 0
                                };

                                for ( var ix2 in ordersByEntity) {
                                    var order = ordersByEntity[ix2];
                                    $scope.argumentOrder(order);
                                    var lastOrder = entityOrders.lastOrder;
                                    entityOrders.uuid = order.uuid;
                                    entityOrders.lastOrder =
                                        lastOrder > order.created ? lastOrder : order.created;
                                    entityOrders.amountTotal += order.amountTotal;
                                    entityOrders.itemsQty += order.itemsQty;
                                }
                                entityOrders.avgPrice =
                                    Math
                                        .round(100 * (entityOrders.amountTotal / entityOrders.itemsQty)) / 100;

                                $scope.filteredEntities.push(entityOrders);
                            }
                        }
                    }

                    $scope.updatePaymentsTotal =
                        function (entities) {
                            $scope.resetPaymentsTotal();

                            for ( var ix in entities) {
                                var entity = entities[ix];
                                var ordersByEntity = ArrayUtils.filter($scope.filteredOrders, {
                                    customerId : entity.entityId
                                });

                                for ( var ix2 in ordersByEntity) {
                                    var order = ordersByEntity[ix2];
                                    // FIXME list only active receivables.
                                    var receivables = ReceivableService.listByDocument(order.uuid);
                                    for ( var ix3 in receivables) {
                                        var receivable = receivables[ix3];
                                        var amount = Number(receivable.amount);

                                        $scope.total[receivable.type].amount += amount;
                                        $scope.total[receivable.type].qty++;
                                        $scope.total.amount += amount;
                                    }

                                    var exchangedProducts =
                                        ProductReturnService.listByDocument(order.uuid);
                                    for ( var ix4 in exchangedProducts) {
                                        var exchanged = exchangedProducts[ix4];
                                        $scope.total.exchange.amount +=
                                            (exchanged.cost * exchanged.quantity);
                                        $scope.total.exchange.qty += Number(exchanged.quantity);
                                        $scope.total.amount +=
                                            (exchanged.cost * exchanged.quantity);
                                    }

                                    var vouchers = VoucherService.listByDocument(order.uuid);
                                    for ( var ix5 in vouchers) {
                                        var voucher = vouchers[ix5];

                                        var voucherAmount = Number(voucher.amount);

                                        $scope.total.voucher.amount += voucherAmount;
                                        $scope.total.voucher.qty += voucher.qty;
                                        $scope.total.amount += voucherAmount;
                                    }
                                }
                            }
                        };

                    /**
                     * Watcher to filter the orders and populate the grid.
                     */
                    $scope.$watchCollection('dtFilter', function () {
                        updateFilteredEntities();
                        $scope.generateVA($scope.filteredEntities);
                    });
                }
            ]);
}(angular));