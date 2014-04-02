(function (angular) {
    'use strict';
    angular
        .module('tnt.catalog.orderList.clients.ctrl', [
            'tnt.catalog.order.service', 'tnt.utils.array', 'tnt.catalog.orderList.service'
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
                'OrderListService',
                'BookService',
                function ($scope, $location, $filter, OrderService, ArrayUtils, ReceivableService,
                    ProductReturnService, VoucherService, OrderListService, BookService) {

                    var allBookEntries = BookService.listEntries();
                    var customers = $scope.customers;

                    $scope.updateAndEnableHideOption = function (entity) {
                        $scope.checkedEntityUUID = entity.entityId;
                        $scope.updateReceivablesTotal([
                            entity
                        ], allBookEntries);
                        if ($scope.hideOptions === true) {
                            $scope.invertHideOption();
                        }
                    };

                    $scope.callUpdateReceivableTotal = function (entities) {
                        $scope.checkedEntityUUID = null;
                        $scope.updateReceivablesTotal($scope.filteredOrders, allBookEntries);
                    };

                    $scope.updateFilteredEntities =
                        function () {
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
                                        amountTotal : 0,
                                        amountTotalWithDiscount : 0
                                    };

                                    for ( var ix2 in ordersByEntity) {
                                        var order = ordersByEntity[ix2];
                                        var lastOrder = entityOrders.lastOrder;

                                        entityOrders.uuid = order.uuid;
                                        entityOrders.lastOrder =
                                            lastOrder > order.created ? lastOrder : order.created;
                                        entityOrders.amountTotal += order.amountTotal;
                                        entityOrders.itemsQty += order.itemsQty;
                                        entityOrders.amountTotalWithDiscount +=
                                            order.amountTotalWithDiscount;
                                    }
                                    entityOrders.avgPrice =
                                        Math
                                            .round(100 * (entityOrders.amountTotalWithDiscount / entityOrders.itemsQty)) / 100;

                                    $scope.filteredEntities.push(entityOrders);
                                }
                            }
                        };

                    $scope.updateEntitiesAndTotals = function () {
                        $scope.updateFilteredEntities();
                        $scope.updateOrdersTotal($scope.filteredOrders);
                        $scope.generateVA($scope.filteredEntities);
                    };

                    $scope.updateEntitiesAndTotals();
                    $scope.updateReceivablesTotal($scope.filteredOrders, allBookEntries);

                    $scope.$on('dtFilterUpdated', function (e) {
                        $scope.updateEntitiesAndTotals();
                    });

                }
            ]);
}(angular));