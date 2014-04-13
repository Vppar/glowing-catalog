'use strict';

angular
    .module('tnt.catalog.productsDelivery', [
        'tnt.catalog.user', 'tnt.catalog.order.service'
    ])
    .controller(
    'ProductsDeliveryCtrl',
    [
        '$filter',
        '$scope',
        '$location',
        '$q',
        '$timeout',
        'UserService',
        'OrderService',
        'EntityService',
        'StockService',
        'BookService',
        'logger',
        'ArrayUtils',
        function ($filter, $scope, $location, $q, $timeout, UserService, OrderService, EntityService, StockService, BookService, logger, ArrayUtils) {

            var log = logger.getLogger('tnt.catalog.productsDelivery.ProductsDeliveryCtrl');

            UserService.redirectIfIsNotLoggedIn();
            $scope.selected = 'orders';
            var selectedOrder = '';
            $scope.checkbox = {
                checked: 'true'
            };
            $scope.dtFilter = {
                dtInitial: setTime(new Date(), 0, 0, 0, 0),
                dtFinal: new Date()
            };
            $scope.maxDate = setTime(new Date(), 23, 59, 59, 999);

            // #################################################################################################################
            // Sumarizator template
            // #################################################################################################################

            var ordersSumarizatorTemplate = {
                enitityCount: 0,
                orders: 0,
                delivered: 0,
                products: 0
            };

            var productsSumarizatorTemplate = {
                total: 0,
                delivered: 0,
                actualDelivery: 0
            };

            // #################################################################################################################
            // Pending Items
            // #################################################################################################################

            var getPendingProducts = function getPendingProducts(order) {
                var pendingProducts = [];
                selectedOrder = order.uuid;
                for (var ix in order.items) {
                    var item = order.items[ix];
                    item.order = order.code;
                    item.created = order.created;
                    // Build unique name.
                    if (item.option) {
                        item.uniqueName = item.SKU + ' - ' + item.option;
                    } else {
                        item.uniqueName = item.SKU;
                    }

                    pendingProducts.push(item);
                }
                return pendingProducts;
            };

            // #################################################################################################################
            // Aux functions
            // #################################################################################################################
            var warmUp = function () {
                $scope.filteredOrders = [];
                $scope.pendingProducts = [];

                $scope.ticket = {};
                $scope.ticket.watchedQty = {};
                $scope.ordersTotals = {};
                $scope.productsTotals = {};
                angular.extend($scope.ordersTotals, ordersSumarizatorTemplate);
                angular.extend($scope.productsTotals, productsSumarizatorTemplate);

                $scope.orders = OrderService.list();
                $scope.filteredOrders = filterProductsByDate($scope.orders);
                $scope.filteredOrders = prepareOrders($scope.filteredOrders);

            };

            var logistics =
                function (orderUUID, updatedItems) {
                    var books = '';
                    var productAmount = 0;
                    var productCost = 0;
                    var stock = 0;
                    var order = OrderService.read(selectedOrder);
                    var promises = [];
                    for (var i in updatedItems) {
                        if (updatedItems[i].dQty > 0) {
                            stock = StockService.findInStock(updatedItems[i].id);
                            stock.quantity = updatedItems[i].dQty;
                            stock.reserve = updatedItems[i].dQty;
                            promises.push(StockService.unreserve(stock));
                            promises.push(StockService.remove(stock));

                            productAmount += updatedItems[i].dQty * updatedItems[i].price;
                            productCost += updatedItems[i].dQty * stock.cost;
                        }
                    }
                    $q.all(promises).then(
                        function () {
                            books =
                                BookService.productDelivery(
                                    order.uuid,
                                    order.customerId,
                                    productAmount,
                                    productCost);
                            var promises = [];
                            for (var y in books) {
                                promises.push(BookService.write(books[y]));
                            }
                            var promise = $q.all(promises);
                            promise.then(function () {
                                log.info('Books updated with succes!', order);
                            }, function (err) {
                                log.error('Failed to edit the books!', order);
                                log.debug(err);
                            });

                        },
                        function (err) {
                            log.error(
                                'Failed to create Stock events: ',
                                orderUUID,
                                updatedItems,
                                ' error:',
                                err);
                            log.debug(
                                'Failed to create Stock events: ',
                                orderUUID,
                                updatedItems,
                                ' error:',
                                err);
                        });

                };

            var prepareOrders = function (orders) {
                for (var ix = 0; ix < orders.length; ix++) {
                    var order = orders[ix];

                    order.customerName = EntityService.read(order.customerId).name;
                    order.totalItems = 0;
                    order.totalItemsDeliv = 0;

                    for (var ix2 = 0; ix2 < order.items.length; ix2++) {
                        var item = order.items[ix2];
                        if (item.type === 'giftCard' || item.type === 'voucher') {
                            order.items.splice(ix2, 1);
                            ix2--;
                            continue;
                        }

                        if (!item.dQty) {
                            item.dQty = 0;
                        }

                        order.totalItems += item.qty;

                        order.totalItemsDeliv += item.dQty;

                        var remaining = (item.qty - item.dQty);
                        var stock = StockService.findInStock(item.id);
                        item.stock = stock.quantity;

                        if (remaining === 0) {
                            item.maxDeliver = 0;
                        } else if (remaining > item.stock) {
                            item.maxDeliver = item.stock;
                        } else {
                            item.maxDeliver = remaining;
                        }
                    }
                    if (order.totalItems === order.totalItemsDeliv) {
                        orders.splice(ix, 1);
                        ix--;
                        continue;
                    }
                }
                return orders;
            };

            function summarizatorOrders(orders) {
                $scope.ordersTotals.orders = orders.length;
                $scope.ordersTotals.enitityCount =
                    ArrayUtils.distinct(orders, 'customerId').length;
                $scope.ordersTotals.delivered = $filter('sum')(orders, 'totalItemsDeliv');
                $scope.ordersTotals.products = $filter('sum')(orders, 'totalItems');
            }

            function sumarizatorProducts(items) {
                $scope.productsTotals.total = $filter('sum')(items, 'qty');
                $scope.productsTotals.delivered = $filter('sum')(items, 'dQty');
            }

            $scope.$watchCollection('dtFilter', function () {
                $scope.filteredOrders = filterProductsByDate($scope.orders);
                $scope.filteredOrders = prepareOrders($scope.filteredOrders);
                summarizatorOrders($scope.filteredOrders);
            });

            var lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
            $scope.$watch('checkbox.checked', function () {
                if ($scope.checkbox.checked === 'true') {
                    if ($scope.dtFilter.dtInitial) {
                        lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
                    }
                    $scope.dtFilter.dtInitial = null;
                    $scope.dtIniDisabled = true;
                } else {
                    $scope.dtIniDisabled = false;
                    $scope.dtFilter.dtInitial = angular.copy(lastFilterDate);
                }
            });

            $scope.getItems = function (order) {
                $scope.pendingProducts = getPendingProducts(order);
                sumarizatorProducts($scope.pendingProducts);
                $scope.selected = 'products';

            };

            $scope.confirm =
                function () {
                    var updatedItems = [];
                    for (var ix in $scope.ticket.watchedQty) {
                        if ($scope.ticket.watchedQty[ix] > 0) {
                            $scope.pendingProducts[ix].dQty = $scope.ticket.watchedQty[ix];

                            if ($scope.pendingProducts[ix].$$hashKey) {
                                delete $scope.pendingProducts[ix].$$hashKey;
                            }
                            updatedItems.push($scope.pendingProducts[ix]);
                        }
                    }
                    var result =
                        OrderService
                            .updateItemQty(selectedOrder, updatedItems)
                            .then(
                            function () {
                                log
                                    .info('Item qty updated! Starting Book and Stock logistics!');
                                logistics(selectedOrder, updatedItems);
                                warmUp();
                                $scope.selected = 'orders';
                            },
                            function (err) {
                                log.error('Failed to Update the item qty.');
                                log.debug(err);
                                return $q.reject(err);
                            });

                    return result;
                };

            $scope.cancel = function () {
                $scope.pendingProducts = [];
                $scope.selected = 'orders';
            };

            $scope.$watch('selected', function (newVal, oldVal) {
                if (newVal === 'orders') {
                    summarizatorOrders($scope.filteredOrders);
                } else if (newVal === 'products') {
                    $scope.ticket = {};
                    $scope.ticket.watchedQty = {};
                }
            });

            $scope.$watchCollection('ticket.watchedQty', function () {
                var total = 0;
                for (var ix in $scope.ticket.watchedQty) {
                    total += $scope.ticket.watchedQty[ix];
                }
                $scope.productsTotals.actualDelivery = total;
            });

            // #################################################################################################################
            // Date filter stuff
            // #################################################################################################################
            function setTime(date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
                return date;
            }

            function filterProductsByDate(products) {
                return angular.copy($filter('filter')(products, filterByDate));
            }

            /**
             * DateFilter
             */
            function filterByDate(product) {
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
                    if (product.created >= initialFilter && product.created <= finalFilter) {
                        return true;
                    }
                    return false;
                } else if (initialFilter) {
                    if (product.created >= initialFilter) {
                        return true;
                    }
                    return false;
                } else if (finalFilter) {
                    if (product.created <= finalFilter) {
                        return true;
                    }
                    return false;
                } else {
                    return true;
                }
            }

            warmUp();

        }
    ]);
