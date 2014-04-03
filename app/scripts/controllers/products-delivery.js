'use strict';

angular.module('tnt.catalog.productsDelivery', [
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
                    function($filter, $scope, $location, $q, $timeout, UserService, OrderService, EntityService, StockService, BookService,
                            logger) {

                        var log = logger.getLogger('tnt.catalog.productsDelivery.ProductsDeliveryCtrl');

                        UserService.redirectIfIsNotLoggedIn();

                        var selectedOrder = '';

                        $scope.dtFilter = {
                            dtInitial : setTime(new Date(), 0, 0, 0, 0),
                            dtFinal : new Date()
                        };

                        // #################################################################################################################
                        // Pending Items
                        // #################################################################################################################

                        var getPendingProducts = function getPendingProducts(order) {
                            var pendingProducts = [];
                            selectedOrder = order.uuid;
                            for ( var ix in order.items) {
                                order.items[ix].order = order.code;
                                order.items[ix].created = order.created;
                                pendingProducts.push(order.items[ix]);
                            }
                            return pendingProducts;
                        };

                        // #################################################################################################################
                        // Aux functions
                        // #################################################################################################################
                        var warmUp = function() {
                            $scope.orders = OrderService.list();
                            $scope.filteredOrders = [];
                            $scope.pendingProducts = [];

                            $scope.ticket = {};
                            $scope.ticket.watchedQty = {};
                        };

                        var logistics = function(orderUUID, updatedItems) {
                            var books = '';
                            var productAmount = 0;
                            var productCost = 0;
                            var stock = 0;
                            var order = OrderService.read(selectedOrder);
                            var promises =[]; 
                            for ( var i in updatedItems) {
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
                            $q.all(promises).then(function(){
                                books = BookService.productDelivery(order.uuid, order.customerId, productAmount, productCost);
                                var promises = [];
                                for ( var y in books) {
                                    promises.push(BookService.write(books[y]));
                                }
                                var promise = $q.all(promises);
                                promise.then(function() {
                                    log.info('Books updated with succes!');
                                }, function(err) {
                                    log.error('Failed to edit the books!');
                                    log.debug(err);
                                });
                                
                            }, function(){
                                console.log('SON OF A BITCH');
                            });
                            
                        };

                        var prepareOrders =
                                function(orders) {
                                    for ( var ix = 0; ix < orders.length; ix++) {
                                        orders[ix].customerName = EntityService.read(orders[ix].customerId).name;
                                        orders[ix].totalItems = 0;
                                        orders[ix].totalItemsDeliv = 0;

                                        for ( var ix2 = 0; ix2 < orders[ix].items.length; ix2++) {

                                            if (orders[ix].items[ix2].type === 'giftCard' || orders[ix].items[ix2].type === 'voucher' ||
                                                orders[ix].items[ix2].type === 'coupom') {
                                                orders[ix].items.splice(ix2, 1);
                                                ix2--;
                                                continue;
                                            }

                                            if (!orders[ix].items[ix2].dQty) {
                                                orders[ix].items[ix2].dQty = 0;
                                            }

                                            orders[ix].totalItems += orders[ix].items[ix2].qty;

                                            orders[ix].totalItemsDeliv += orders[ix].items[ix2].dQty;

                                            var remaining = (orders[ix].items[ix2].qty - orders[ix].items[ix2].dQty);
                                            var stock = StockService.findInStock(orders[ix].items[ix2].id);
                                            orders[ix].items[ix2].stock = stock.quantity;

                                            if (remaining === 0) {
                                                orders[ix].items[ix2].maxDeliver = 0;
                                            } else if (remaining > orders[ix].items[ix2].stock) {
                                                orders[ix].items[ix2].maxDeliver = orders[ix].items[ix2].stock;
                                            } else {
                                                orders[ix].items[ix2].maxDeliver = remaining;
                                            }
                                        }
                                        if (orders[ix].totalItems === orders[ix].totalItemsDeliv) {
                                            orders.splice(ix, 1);
                                            ix--;
                                            continue;
                                        }
                                    }
                                    return orders;
                                };

                        $scope.$watchCollection('dtFilter', function() {
                            $scope.filteredOrders = filterProductsByDate($scope.orders);
                            $scope.filteredOrders = prepareOrders($scope.filteredOrders);
                        });

                        $scope.getItems = function(index) {
                            $scope.pendingProducts = getPendingProducts($scope.filteredOrders[index]);
                            $scope.selected = 'products';
                        };

                        $scope.confirm = function() {
                            var updatedItems = [];
                            for ( var ix in $scope.ticket.watchedQty) {
                                $scope.pendingProducts[ix].dQty = $scope.ticket.watchedQty[ix];
                                if ($scope.pendingProducts[ix].$$hashKey) {
                                    delete $scope.pendingProducts[ix].$$hashKey;
                                }
                                updatedItems.push($scope.pendingProducts[ix]);
                            }
                            
                            return OrderService.updateItemQty(selectedOrder, updatedItems).then(function() {
                                log.info('Item qty updated! Starting Book and Stock logistics!');
                                logistics(selectedOrder, updatedItems);
                                warmUp();
                                $scope.selected = 'orders';
                            }, function(err) {
                                log.error('Failed to Update the item qty.');
                                log.debug(err);
                                return $q.reject(err);
                            });
                        };

                        $scope.$watch('selected', function() {
                            $scope.ticket = {};
                            $scope.ticket.watchedQty = {};
                            $scope.filteredOrders = filterProductsByDate($scope.orders);
                            $scope.filteredOrders = prepareOrders($scope.filteredOrders);

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
