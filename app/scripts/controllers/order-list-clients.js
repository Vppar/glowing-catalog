(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.clients.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListClientsCtrl',
            ['$scope', '$location', '$filter', 'OrderService', 'ArrayUtils', 'ReceivableService', 'ProductReturnService', 'VoucherService',
            function($scope, $location, $filter, OrderService, ArrayUtils, ReceivableService, ProductReturnService, VoucherService) {

                // $scope.entities come from OrderListCtrl
                var entities = $scope.entities;

                // $scope.filteredOrders come from OrderListCtrl
                $scope.filteredEntities = [];

                $scope.updateAndEnableHideOption = function(entity) {
                    $scope.updateReceivablesTotal(entity);
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
                                entityOrders.lastOrder = lastOrder > order.created ? lastOrder : order.created;
                                entityOrders.amountTotal += order.amountTotal;
                                entityOrders.itemsQty += order.itemsQty;
                            }
                            entityOrders.avgPrice = Math.round(100 * (entityOrders.amountTotal / entityOrders.itemsQty)) / 100;
                            
                            $scope.filteredEntities.push(entityOrders);
                        }
                    }
                }

                /**
                 * Watcher to filter the orders and populate the grid.
                 */
                $scope.$watchCollection('dtFilter', function() {
                    updateFilteredEntities();
                    $scope.generateVA($scope.filteredEntities);
                });
            }]);
}(angular));