(function (angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array', 'tnt.catalog.orderList.service'
    ]).controller(
        'OrderListCtrl',[
        '$scope', '$filter', 'OrderService', 'EntityService', 
        'UserService', 'VoucherService', 'ArrayUtils', 'OrderListService', 'BookService',
        
        function ($scope, $filter, OrderService, EntityService, 
            UserService, VoucherService, ArrayUtils, OrderListService, BookService) {
            
            // Login verify
            UserService.redirectIfIsNotLoggedIn();
            var allBookEntries = BookService.listEntries();
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

            $scope.augmentOrder = function (order, bookEntries) {
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
                
                var vouchers = VoucherService.listByDocument(order.uuid);
                vouchers = $filter('filter')(vouchers, function(voucher){
                    return voucher.redeemed === undefined;
                });
                
                var voucherAmount = 0;
                var count=0;
                for ( var ix4 in vouchers) {
                    count++;
                    var voucher = vouchers[ix4];
                    voucherAmount += voucher.amount;
                }
                amountTotal += voucherAmount;
                var discount = OrderListService.getTotalDiscountByOrder(order.uuid, bookEntries);
                order.voucherTotal = voucherAmount;
                order.voucherQty = count;
                order.itemsQty = qtyTotal;
                order.avgPrice = (priceTotal + amountTotal - discount) / (qtyTotal);
                order.amountTotal = (priceTotal + amountTotal);
                order.amountTotalWithDiscount = ((priceTotal + amountTotal) - discount);
            };

            /**
             * Generate VA
             */
            $scope.generateVA =
                function (orders) {
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
                function (orders, allBookEntries) {
                    $scope.resetOrdersTotal();
                    var entityMap = {};
                    var filteredOrders = orders;
                    for ( var ix in filteredOrders) {
                        var filteredOrder = filteredOrders[ix];
                        
                        var bookEntries =
                            $filter('filter')(allBookEntries, function (entry) {
                                return (entry.document === filteredOrder.uuid);
                            });
                        
                        $scope.augmentOrder(filteredOrder, bookEntries);

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

            $scope.updateReceivablesTotal = function (orders) {
                $scope.resetPaymentsTotal();
                for ( var ix in orders) {
                    var order = orders[ix];

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
                    var resultCheck = OrderListService.getTotalByType(order.uuid, 'check', bookEntries);
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
                    var bookEntries = BookService.listEntries();
                    orders = filterOrdersByDate(orders);
                    $scope.updateReceivablesTotal(orders, bookEntries);
                    $scope.updateOrdersTotal(orders, bookEntries);
                    $scope.generateVA(orders);
                    $scope.filteredOrders = orders;
            };

            // #############################################################################################################
            // Local functions and variables
            // #############################################################################################################
            $scope.dtFilter = initializeDates(angular.copy($scope.dtFilter));
            $scope.total = {};
            $scope.orders = OrderService.list();
            $scope.customers = EntityService.list();
            $scope.avaliableCustomers = [];
            $scope.customerId = '0';

            $scope.filterOrders($scope.orders);
            
            $scope.filteredEntities = [];
            $scope.checkedEntityUUID = null;
            $scope.filteredProducts = [];
            $scope.filteredProducts.totalStock = 0;
            $scope.checkedProductSKU = null;
            $scope.avaliableCustomers = [];
            
            /**
             * whenever dtFilter changes filter list.
             */
            $scope.$watchCollection('dtFilter', function (newVal, oldVal) {
                $scope.filterOrders($scope.orders);
                $scope.$broadcast('dtFilterUpdated');
            });

        }]);
}(angular));
