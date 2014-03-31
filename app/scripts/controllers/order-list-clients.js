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

                    $scope.updateFilteredEntities = function () {
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
                                    
                                    var bookEntries =
                                        $filter('filter')(allBookEntries, function (entry) {
                                            return (entry.document === order.uuid);
                                        });
                                    
                                    //CASH
                                    var cashAmount = OrderListService.getTotalByType(order.uuid, 'cash', bookEntries);
                                    $scope.total.cash.amount += cashAmount.amount;
                                    $scope.total.cash.qty += cashAmount.qty;
                                    $scope.total.amount += cashAmount.amount;
                                    
                                    //Check
                                    var resultCheck = OrderListService.getTotalByType(order.uuid, 'check',bookEntries);
                                    $scope.total.check.amount += resultCheck.amount;
                                    $scope.total.check.qty += resultCheck.qty;
                                    $scope.total.amount += resultCheck.amount;
                                    
                                    //Card
                                    var resultCard = OrderListService.getTotalByType(order.uuid, 'creditCard', bookEntries);
                                    $scope.total.creditCard.amount += resultCard.amount;
                                    $scope.total.creditCard.qty += resultCard.qty;
                                    $scope.total.amount += resultCard.amount;
                                    
                                    //Cuff
                                    var resultCuff = OrderListService.getTotalByType(order.uuid, 'onCuff', bookEntries);
                                    $scope.total.onCuff.amount += resultCuff.amount;
                                    $scope.total.onCuff.qty += resultCuff.qty;
                                    $scope.total.amount += resultCuff.amount;
                                    
                                    //Voucher
                                    var resultVoucher = OrderListService.getTotalByType(order.uuid, 'voucher', bookEntries);
                                    $scope.total.voucher.amount += resultVoucher.amount;
                                    $scope.total.voucher.qty += resultVoucher.qty;
                                    $scope.total.amount += resultVoucher.amount;
                                    
                                    //Exchange Products
                                    var resultExchangeProducts = OrderListService.getTotalByType(order.uuid, 'exchange', bookEntries);
                                    $scope.total.exchange.amount += resultExchangeProducts.amount;
                                    $scope.total.exchange.qty += resultExchangeProducts.qty;
                                    $scope.total.amount += resultExchangeProducts.amount;
                                    
                                    var discount = OrderListService.getTotalDiscountByOrder(order.uuid, bookEntries);
                                    $scope.total.discount += discount;
                            }
                        };
                    };
                    
                    $scope.updateEntitiesAndTotals = function (){
                        $scope.updateFilteredEntities();
                        $scope.updateOrdersTotal($scope.filteredOrders);
                        $scope.generateVA($scope.filteredEntities);
                    };
                    
                   $scope.updateEntitiesAndTotals();
                    
                    
                    $scope.$on('dtFilterUpdated', function(e) {  
                        $scope.updateEntitiesAndTotals();
                    });
                    
                }
            ]);
}(angular));