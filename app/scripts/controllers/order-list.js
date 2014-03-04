(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
            'OrderListCtrl',
            function($scope, $location, $filter, OrderService, EntityService, ReceivableService, UserService, ProductReturnService,
                    VoucherService, ArrayUtils) {

                UserService.redirectIfIsNotLoggedIn();

                // #############################################################################################################
                // Warming up the controller
                // #############################################################################################################

                var receivablesTotalTemplate = {
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
                    }
                };
                var ordersTotalTemplate = {
                    all : {
                        orderCount : 0,
                        entityCount : 0,
                        productCount : 0,
                        stock : 0,
                        qty : 0,
                        avgPrice : 0,
                        amount : 0,
                        lastOrder : 0
                    }
                };

                var hideOptions = true;

                // initialize dates
                // Set first and last instants of dates.
                var dtInitial = new Date();
                dtInitial.setHours(0);
                dtInitial.setMinutes(0);
                dtInitial.setSeconds(0);
                dtInitial.setMilliseconds(0);

                var dtFinal = new Date();
                dtFinal.setHours(23);
                dtFinal.setMinutes(59);
                dtFinal.setSeconds(59);
                dtFinal.setMilliseconds(999);

                $scope.total = {};
                $scope.orders = OrderService.list();
                $scope.entities = EntityService.list();

                $scope.dateFilter = {
                    dtInitial : dtInitial,
                    dtFinal : dtFinal
                };

                $scope.resetPaymentsTotal = function() {
                    angular.extend($scope.total, angular.copy(receivablesTotalTemplate));
                };
                $scope.resetOrdersTotal = function() {
                    angular.extend($scope.total, angular.copy(ordersTotalTemplate));
                };

                $scope.invertHideOption = function() {
                    $scope.hideOptions = !hideOptions;
                    hideOptions = !hideOptions;
                };

                $scope.startHideOption = function() {
                    $scope.hideOptions = hideOptions;
                };

                function argumentOrder(order) {
                    // Find the entity name
                    var entity = ArrayUtils.find($scope.customers, 'uuid', order.customerId);
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
                    order.amountTotal = (priceTotal + amountTotal);
                }

                /**
                 * Generate VA
                 */
                $scope.generateVA = function generateVa(filterList) {
                    var acumulator = 0;
                    var biggestOrder = {
                        va : 0
                    };
                    var biggestRounded = 0;
                    for ( var ix in filterList) {
                        var order = filterList[ix];
                        if (angular.isObject(order)) {
                            order.va = (order.amountTotal / $scope.total.all.amount) * 100;
                            var roundedVa = (Math.round(100 * order.va) / 100);
                            acumulator += roundedVa;
                            order.va = roundedVa;
                            if (roundedVa > biggestOrder.va) {
                                biggestOrder = order;
                                biggestRounded = roundedVa;
                            }
                        }
                    }
                    biggestOrder.va = biggestRounded + Math.round(100 * (100 - Number(acumulator))) / 100;
                };

                function updateOrdersTotal(orders) {
                    $scope.resetOrdersTotal();
                    var entityMap = {};
                    var filteredOrders = orders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];
                        // argumenting
                        argumentOrder(filteredOrder);

                        if (!entityMap[filteredOrder.customerId]) {
                            entityMap[filteredOrder.customerId] = filteredOrder.customerId;
                            $scope.total.all.entityCount++;
                        }

                        $scope.total.all.amount += filteredOrder.amountTotal;
                        $scope.total.all.qty += filteredOrder.itemsQty;
                        $scope.total.all.orderCount++;

                    }

                    var avgPrice = Math.round(100 * ($scope.total.all.amount / $scope.total.all.qty)) / 100;
                    if (!isNaN(avgPrice)) {
                        $scope.total.all.avgPrice = avgPrice;
                    } else {
                        $scope.total.all.avgPrice = 0;
                    }
                }

                /**
                 * UpdatePaymentTotals
                 */
                $scope.updateReceivablesTotal = function(orders) {
                    $scope.resetPaymentsTotal();
                    for ( var ix in orders) {
                        var order = orders[ix];
                        var receivables = ReceivableService.listByDocument(order.uuid);
                        for ( var ix2 in receivables) {
                            var receivable = receivables[ix2];
                            var amount = Number(receivable.amount);

                            $scope.total[receivable.type].amount += amount;
                            $scope.total[receivable.type].qty++;
                        }

                        var exchangedProducts = ProductReturnService.listByDocument(order.uuid);
                        for ( var ix3 in exchangedProducts) {
                            var exchanged = exchangedProducts[ix3];
                            $scope.total.exchange.amount += (exchanged.cost * exchanged.quantity);
                            $scope.total.exchange.qty += Number(exchanged.quantity);
                        }

                        var vouchers = VoucherService.listByDocument(order.uuid);
                        for ( var ix4 in vouchers) {
                            var voucher = vouchers[ix4];

                            var voucherAmount = Number(voucher.amount);

                            $scope.total.voucher.amount += voucherAmount;
                            $scope.total.voucher.qty += voucher.qty;
                        }
                    }
                };

                $scope.filterOrders = function(orders) {
                    orders = filterOrdersByDate(orders);
                    
                    $scope.updateReceivablesTotal(orders);
                    updateOrdersTotal(orders);
                    $scope.generateVA(orders);
                    $scope.filteredOrders = orders;
                };

                // #############################################################################################################
                // Local functions and variables
                // #############################################################################################################

                $scope.customers = EntityService.list();

                $scope.filter = {
                    customerId : ''
                };

                function filterOrdersByDate(orders){
                    return angular.copy($filter('filter')(orders, $scope.filterByDate));
                };
                
                
                /**
                 * ClientFilter
                 */
                $scope.filterByClient = function filterByClient(order) {
                    if ($scope.filter.customerId === '') {
                        return true;
                    } else if (order.customerId === $scope.filter.customerId) {
                        return true;
                    }
                };

                /**
                 * DateFilter
                 */
                $scope.filterByDate = function filterByDate(order) {
                    var initialFilter = null;
                    var finalFilter = null;
                    var isDateInitial = false;
                    var isDateFinal = false;
                    if ($scope.dateFilter.dtInitial instanceof Date) {

                        $scope.dateFilter.dtInitial.setHours(0);
                        $scope.dateFilter.dtInitial.setMinutes(0);
                        $scope.dateFilter.dtInitial.setSeconds(0);

                        initialFilter = $scope.dateFilter.dtInitial.getTime();

                        isDateInitial = true;
                    }
                    if ($scope.dateFilter.dtFinal instanceof Date) {

                        $scope.dateFilter.dtFinal.setHours(23);
                        $scope.dateFilter.dtFinal.setMinutes(59);
                        $scope.dateFilter.dtFinal.setSeconds(59);

                        finalFilter = $scope.dateFilter.dtFinal.getTime();

                        isDateFinal = true;
                    }
                    if (isDateInitial && isDateFinal) {
                        if ($scope.dateFilter.dtInitial.getTime() > $scope.dateFilter.dtFinal.getTime()) {
                            $scope.dateFilter.dtFinal = angular.copy($scope.dateFilter.dtInitial);
                        }
                    }

                    if (initialFilter && finalFilter) {
                        if (order.created >= initialFilter && order.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else if (initialFilter) {
                        if (order.created >= initialFilter) {
                            return true;
                        }
                        return false;
                    } else if (finalFilter) {
                        if (order.created <= finalFilter) {
                            return true;
                        }
                        return false;
                    } else {
                        return true;
                    }
                };

                /**
                 * Watcher to filter the orders and populate the grid.
                 */
                $scope.$watchCollection('dateFilter', function() {
                    $scope.filterOrders($scope.orders);
                    /*
                     * $scope.filteredOrders =
                     * angular.copy($filter('filter')(orders,
                     * $scope.filterByDate)); updateOrdersTotal();
                     * $scope.updatePaymentsTotal($scope.filteredOrders);
                     * $scope.generateVA($scope.filteredOrders);
                     */
                });
            });
}(angular));
