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
                function ($scope, $location, $filter, OrderService, ArrayUtils, ReceivableService,
                    ProductReturnService, VoucherService, OrderListService) {

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
                                    amountTotal : 0,
                                    amountTotalWithDiscount : 0
                                };

                                for ( var ix2 in ordersByEntity) {
                                    var order = ordersByEntity[ix2];
                                    $scope.augmentOrder(order);
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
                                  //CASH
                                    var cashAmount = OrderListService.getTotalByType(order.uuid, 'cash');
                                    $scope.total.cash.amount += cashAmount.amount;
                                    $scope.total.cash.qty += cashAmount.qty;
                                    $scope.total.amount += cashAmount.amount;
                                    
                                    //Check
                                    var resultCheck = OrderListService.getTotalByType(order.uuid, 'check');
                                    $scope.total.check.amount += resultCheck.amount;
                                    $scope.total.check.qty += resultCheck.qty;
                                    $scope.total.amount += resultCheck.amount;
                                    
                                    //Card
                                    var resultCard = OrderListService.getTotalByType(order.uuid, 'creditCard');
                                    $scope.total.creditCard.amount += resultCard.amount;
                                    $scope.total.creditCard.qty += resultCard.qty;
                                    $scope.total.amount += resultCard.amount;
                                    
                                    //Cuff
                                    var resultCuff = OrderListService.getTotalByType(order.uuid, 'onCuff');
                                    $scope.total.onCuff.amount += resultCuff.amount;
                                    $scope.total.onCuff.qty += resultCuff.qty;
                                    $scope.total.amount += resultCuff.amount;
                                    
                                    //Voucher
                                    var resultVoucher = OrderListService.getTotalByType(order.uuid, 'voucher');
                                    $scope.total.voucher.amount += resultVoucher.amount;
                                    $scope.total.voucher.qty += resultVoucher.qty;
                                    $scope.total.amount += resultVoucher.amount;
                                    
                                    //Exchange Products
                                    var resultExchangeProducts = OrderListService.getTotalByType(order.uuid, 'exchange');
                                    $scope.total.exchange.amount += resultExchangeProducts.amount;
                                    $scope.total.exchange.qty += resultExchangeProducts.qty;
                                    $scope.total.amount += resultExchangeProducts.amount;
                                    
                                    var discount = OrderListService.getTotalDiscountByOrder(order.uuid);
                                    $scope.total.discount += discount;
                            }
                        };
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