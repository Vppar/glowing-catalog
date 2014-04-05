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
                        $scope.updateReceivablesTotalByEntities([
                            entity
                        ], allBookEntries);
                        if ($scope.hideOptions === true) {
                            $scope.invertHideOption();
                        }
                    };

                    $scope.callUpdateReceivableTotalByEntities = function (entities) {
                        $scope.checkedEntityUUID = null;
                        $scope.updateReceivablesTotalByEntities(entities, allBookEntries);
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

                        
                        
                        /**
                         * Interate all orders searching for payments from bookEntries.
                         * Discount on amount of payments vouchers sold.
                         *    (distribute the value in all payments types with amount > 0.)
                         * Compute all discounts on orders.   
                         * Compute totals of payments by type
                         * 
                         */
                        $scope.updateReceivablesTotalByEntities = function (entities) {
                            $scope.resetPaymentsTotal();
                            for ( var ix in entities) {
                                var entity = entities[ix];
                                var ordersByEntity = ArrayUtils.filter($scope.filteredOrders, {
                                    customerId : entity.entityId
                                });
                                for ( var ix in ordersByEntity) {
                                    var order = ordersByEntity[ix];
                                    var receivablesByType= [];
                                    var total= 0;
                                    var totalVoucherSold = 0;
                                    var bookEntries =
                                        $filter('filter')(allBookEntries, function (entry) {
                                            return (entry.document === order.uuid);
                                        });
                                    
                                    //CASH && CHANGE
                                    var change = OrderListService.getTotalByType(order.uuid, 'change', bookEntries);
                                    var cash = OrderListService.getTotalByType(order.uuid, 'cash', bookEntries);
                                    cash.amount -= change.amount;
                                    total += cash.amount;
                                    receivablesByType.push(cash);
                                    
                                    
                                    //Check
                                    var check = OrderListService.getTotalByType(order.uuid, 'check', bookEntries);
                                    total += check.amount;
                                    receivablesByType.push(check);

                                    //Card
                                    var card = OrderListService.getTotalByType(order.uuid, 'creditCard', bookEntries);
                                    total += card.amount;
                                    receivablesByType.push(card);
                                    
                                    //Cuff
                                    var cuff = OrderListService.getTotalByType(order.uuid, 'onCuff', bookEntries);
                                    total += cuff.amount;
                                    receivablesByType.push(cuff);
                                    
                                    //Voucher
                                    var voucher =OrderListService.getTotalByType(order.uuid, 'voucher', bookEntries);
                                    total += voucher.amount;
                                    receivablesByType.push(voucher);
                                    
                                    //Exchange Products
                                    var exchange = OrderListService.getTotalByType(order.uuid, 'exchange', bookEntries);
                                    total += exchange.amount;
                                    receivablesByType.push(exchange);
                                    
                                    var voucherSold = OrderListService.getTotalByType(order.uuid, 'soldVoucher', bookEntries);
                                    totalVoucherSold += voucherSold.amount;
                                    
                                    //FIXME - someday this will be usefull... someday.
                                    //Setting all qty before call Distribution of discounts
                                    /*$scope.total.cash.qty += cash.qty;
                                    $scope.total.check.qty += check.qty;
                                    $scope.total.creditCard.qty += card.qty;
                                    $scope.total.onCuff.qty += cuff.qty;
                                    $scope.total.voucher.qty += voucher.qty;
                                    $scope.total.exchange.qty += exchange.qty;*/
                                    
                                    //remove sold voucher from total of order and distribute the amount between payments.
                                    if(totalVoucherSold > 0 ){
                                        $scope.removeVoucherValuesFromPaymentsTotals(receivablesByType, total ,totalVoucherSold);
                                    }
                                    

                                    // CASH
                                    var cashAmount =
                                        receivablesByType[0].specificDiscount
                                            ? receivablesByType[0].amount -
                                                receivablesByType[0].specificDiscount
                                            : receivablesByType[0].amount;

                                    $scope.total.amount += cashAmount;
                                    $scope.total.cash.amount += cashAmount;

                                    // Check
                                    var checkAmount =
                                        receivablesByType[1].specificDiscount
                                            ? receivablesByType[1].amount -
                                                receivablesByType[1].specificDiscount
                                            : receivablesByType[1].amount;
                                    $scope.total.amount += checkAmount;
                                    $scope.total.check.amount += checkAmount;

                                    // Card
                                    var cardAmount =
                                        receivablesByType[2].specificDiscount
                                            ? receivablesByType[2].amount -
                                                receivablesByType[2].specificDiscount
                                            : receivablesByType[2].amount;
                                    $scope.total.amount += cardAmount;
                                    $scope.total.creditCard.amount += cardAmount;

                                    // Cuff
                                    var onCuffAmount =
                                        receivablesByType[3].specificDiscount
                                            ? receivablesByType[3].amount -
                                                receivablesByType[3].specificDiscount
                                            : receivablesByType[3].amount;
                                    $scope.total.amount += onCuffAmount;
                                    $scope.total.onCuff.amount += onCuffAmount;

                                    // Voucher
                                    var voucherAmount =
                                        receivablesByType[4].specificDiscount
                                            ? receivablesByType[4].amount -
                                                receivablesByType[4].specificDiscount
                                            : receivablesByType[4].amount;
                                    $scope.total.amount += voucherAmount;
                                    $scope.total.voucher.amount += voucherAmount;

                                    // Exchange Products
                                    var exchangeAmount =
                                        receivablesByType[5].specificDiscount
                                            ? receivablesByType[5].amount -
                                                receivablesByType[5].specificDiscount
                                            : receivablesByType[5].amount;
                                    $scope.total.amount += exchangeAmount;
                                    $scope.total.exchange.amount += exchangeAmount; 
                                    
                                    var discount = OrderListService.getTotalDiscountByOrder(order.uuid, bookEntries);
                                    $scope.total.discount += discount;
                                    
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