(function (angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller(
        'OrderListCtrl',
        function ($scope, $location, $filter, OrderService, EntityService, ReceivableService,
            UserService, ProductReturnService, VoucherService, ArrayUtils, BookService) {
            // Login verify
            UserService.redirectIfIsNotLoggedIn();
            var hideOptions = true;
            /**
             * Templates
             */
            var receivablesTotalTemplate = {
                amount : 0,
                discount : 0,
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
                    amountWithDiscount : 0,
                    lastOrder : 0,
                }
            };

            var dtFilterTemplate = {
                dtInitial : null,
                dtFinal : null
            };

            /**
             * Auxiliary functions
             */
            function setTime (date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
                return date;
            }

            function initializeDates (date) {
                if (!date) {
                    date = angular.copy(dtFilterTemplate);
                }

                if (!(date.dtInitial instanceof Date)) {
                    date.dtInitial = setTime(new Date(), 0, 0, 0, 0);
                } else {
                    date.dtInitial = setTime(date.dtInitial, 0, 0, 0, 0);
                }

                if (!(date.dtFinal instanceof Date)) {
                    date.dtFinal = setTime(new Date(), 23, 59, 59, 999);
                } else {
                    date.dtFinal = setTime(date.dtFinal, 23, 59, 59, 999);
                }

                return date;
            }

            function filterOrdersByDate (orders) {
                return angular.copy($filter('filter')(orders, filterByDate));
            }

            /**
             * DateFilter
             */
            function filterByDate (order) {
                var initialFilter = null;
                var finalFilter = null;
                var isDtInitial = false;
                var isDtFinal = false;
                if ($scope.dtFilter.dtInitial instanceof Date) {

                    $scope.dtFilter.dtInitial = setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);

                    initialFilter = $scope.dtFilter.dtInitial.getTime();

                    isDtInitial = true;
                }
                if ($scope.dtFilter.dtFinal instanceof Date) {

                    $scope.dtFilter.dtFinal = setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
                    finalFilter = $scope.dtFilter.dtFinal.getTime();

                    isDtFinal = true;
                }

                if (isDtInitial && isDtFinal) {
                    if ($scope.dtFilter.dtInitial.getTime() > $scope.dtFilter.dtFinal.getTime()) {
                        $scope.dtFilter.dtFinal = angular.copy($scope.dtFilter.dtInitial);
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
            }

            /**
             * scope functions
             */
            $scope.resetPaymentsTotal = function () {
                angular.extend($scope.total, angular.copy(receivablesTotalTemplate));
            };

            $scope.resetOrdersTotal = function () {
                angular.extend($scope.total, angular.copy(ordersTotalTemplate));
            };

            $scope.invertHideOption = function () {
                $scope.hideOptions = !hideOptions;
                hideOptions = !hideOptions;
            };

            $scope.startHideOption = function () {
                $scope.hideOptions = hideOptions;
            };

            $scope.argumentOrder = function (order) {
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
                var vouchers = VoucherService.listByOrigin(order.uuid);
                var voucherAmount = 0;
                for ( var ix4 in vouchers) {
                    var voucher = vouchers[ix4];
                    voucherAmount += voucher.amount;
                }
                amountTotal += voucherAmount;
                var discount = $scope.getTotalDiscountByOrder(order);
                order.itemsQty = qtyTotal;
                order.avgPrice = (priceTotal + amountTotal - discount) / (qtyTotal);
                order.amountTotal = (priceTotal + amountTotal);
                order.amountTotalWithDiscount = ((priceTotal + amountTotal) - discount);
            };

            /**
             * Generate VA
             */
            $scope.generateVA =
                function generateVa (orders) {
                    var acumulator = 0;
                    var biggestOrder = {
                        va : 0
                    };
                    var biggestRounded = 0;
                    for ( var ix in orders) {
                        var order = orders[ix];
                        if (angular.isObject(order)) {
                            order.va =
                                (order.amountTotalWithDiscount / $scope.total.all.amountWithDiscount) * 100;
                            var roundedVa = (Math.round(100 * order.va) / 100);
                            acumulator += roundedVa;
                            order.va = roundedVa;
                            if (roundedVa > biggestOrder.va) {
                                biggestOrder = order;
                                biggestRounded = roundedVa;
                            }
                        }
                    }
                    biggestOrder.va =
                        biggestRounded + Math.round(100 * (100 - Number(acumulator))) / 100;
                    
                };

            $scope.updateOrdersTotal =
                function (orders) {
                    $scope.resetOrdersTotal();
                    var entityMap = {};
                    var filteredOrders = orders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];
                        // argumenting
                        $scope.argumentOrder(filteredOrder);

                        if (!entityMap[filteredOrder.customerId]) {
                            entityMap[filteredOrder.customerId] = filteredOrder.customerId;
                            $scope.total.all.entityCount++;
                        }

                        $scope.total.all.amountWithDiscount += filteredOrder.amountTotalWithDiscount;
                        $scope.total.all.amount += filteredOrder.amountTotal;
                        $scope.total.all.qty += filteredOrder.itemsQty;
                        $scope.total.all.orderCount++;
                    }

                    var avgPrice =
                        Math.round(100 * ($scope.total.all.amountWithDiscount / $scope.total.all.qty)) / 100;
                    if (!isNaN(avgPrice)) {
                        $scope.total.all.avgPrice = avgPrice;
                    } else {
                        $scope.total.all.avgPrice = 0;
                    }
                };

            $scope.getTotalDiscountByOrder = function (order) {
                var bookEntries = BookService.listByOrder(order.uuid);
                bookEntries = $filter('filter')(bookEntries, bookEntriesByOrder);
                return $filter('sum')(bookEntries, 'amount');
            };

            function bookEntriesByOrder (bookEntry) {
                var result =
                    (bookEntry.debitAccount === 41301) && (bookEntry.creditAccount === 70001);
                return result;
            }

            /**
             * ClientFilter
             */
            $scope.filterByClient = function filterByClient (order) {
                if ($scope.customerId === '') {
                    return true;
                } else if (order.customerId === $scope.customerId) {
                    return true;
                }
            };

            /**
             * UpdatePaymentTotals
             */
            $scope.updateReceivablesTotal = function (orders) {
                $scope.resetPaymentsTotal();
                for ( var ix in orders) {
                    var order = orders[ix];

                    // FIXME list only active receivables.
                    var receivables = ReceivableService.listByDocument(order.uuid);
                    for ( var ix2 in receivables) {
                        var receivable = receivables[ix2];
                        var amount = Number(receivable.amount);

                        $scope.total[receivable.type].amount += amount;
                        $scope.total[receivable.type].qty++;
                        $scope.total.amount += amount;
                    }

                    var exchangedProducts = ProductReturnService.listByDocument(order.uuid);
                    for ( var ix3 in exchangedProducts) {
                        var exchanged = exchangedProducts[ix3];
                        $scope.total.exchange.amount += (exchanged.cost * exchanged.quantity);
                        $scope.total.exchange.qty += Number(exchanged.quantity);
                        $scope.total.amount += (exchanged.cost * exchanged.quantity);
                    }

                    var vouchers = VoucherService.listByDocument(order.uuid);
                    for ( var ix4 in vouchers) {
                        var voucher = vouchers[ix4];

                        var voucherAmount = Number(voucher.amount);

                        $scope.total.voucher.amount += voucherAmount;
                        $scope.total.voucher.qty += voucher.qty;
                        $scope.total.amount += voucherAmount;
                    }

                    // computing the discount.
                    var discount = $scope.getTotalDiscountByOrder(order);
                    $scope.total.discount += discount;

                }

            };

            $scope.computeAvaliableCustomers = function (customers) {
                $scope.avaliableCustomers = [];
                for ( var ix in customers) {
                    var customer = customers[ix];
                    var ordersByCustomer = ArrayUtils.filter($scope.filteredOrders, {
                        customerId : customer.uuid
                    });

                    if (ordersByCustomer.length > 0) {
                        $scope.avaliableCustomers.push({
                            name : ordersByCustomer[0].entityName,
                            uuid : ordersByCustomer[0].customerId
                        });
                    }

                }

                return $scope.avaliableCustomers;
            };

            $scope.filterOrders = function (orders) {
                orders = filterOrdersByDate(orders);
                $scope.updateReceivablesTotal(orders);
                $scope.updateOrdersTotal(orders);
                $scope.generateVA(orders);
                $scope.filteredOrders = orders;
                return $scope.filteredOrders;
            };

            // #############################################################################################################
            // Local functions and variables
            // #############################################################################################################
            $scope.dtFilter = initializeDates($scope.dtFilter);
            $scope.total = {};
            $scope.orders = OrderService.list();
            $scope.customers = EntityService.list();
            $scope.avaliableCustomers = [];
            $scope.customerId = '0';

            /**
             * whenever dtFilter changes filter list.
             */
            $scope.$watchCollection('dtFilter', function () {
                $scope.filterOrders($scope.orders);
            });

        });
}(angular));
