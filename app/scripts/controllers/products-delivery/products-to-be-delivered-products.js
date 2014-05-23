(function (angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBeDeliveryProducts', []).controller(
        'ProductsToBeDeliveryProductsCtrl',
        function ($scope, $q, $filter, logger, OrderService, StockService, BookService, DialogService, SchedulingService, ArrayUtils) {

            // #####################################################################################################
            // Local variables
            // #####################################################################################################
            var log = logger.getLogger('tnt.catalog.productsDelivery.ProductsDeliveryCtrl');
            var TODAY = new Date();

            // #####################################################################################################
            // Local Functions
            // #####################################################################################################
            function setTime(date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
                return date;
            }

            function getUpdatedItems(type) {
                var updatedItems = [];
                for (var ix in $scope.ticket.watchedQty) {
                    var product = $scope.selectedOrder.selectedOrderProducts[ix];
                    // FIXME should create a item only with
                    // necessary properties
                    if (type === 'delivery') {
                        product.dQty = $scope.ticket.watchedQty[ix];
                    } else if (type === 'schedule') {
                        product.sQty = $scope.ticket.watchedQty[ix];
                    }

                    if (product.$$hashKey) {
                        delete product.$$hashKey;
                    }
                    updatedItems.push(product);
                }
                return updatedItems;
            }

            function logistics(orderUUID, updatedItems) {
                var books = '';
                var productAmount = 0;
                var productCost = 0;
                var stock = 0;
                var order = OrderService.read($scope.selectedOrder.uuid);
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
                var schedule = SchedulingService.readByDocument(orderUUID);
                if (schedule) {
                    promises.push(SchedulingService.update(
                        schedule.uuid,
                        new Date(),
                        updatedItems,
                        false));
                } else {
                    promises.push(SchedulingService.create(
                        orderUUID,
                        new Date(),
                        updatedItems,
                        false));
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
                            $scope.resetOrders();
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

            }

            function delivery() {
                var updatedItems = getUpdatedItems('delivery');
                var result =
                    OrderService.updateItemQty($scope.selectedOrder.uuid, updatedItems).then(
                        function () {
                            log.info('Item qty updated! Starting Book and Stock logistics!');
                            logistics($scope.selectedOrder.uuid, updatedItems);
                            $scope.selected.tab = 'toBeDelivered';
                            $scope.resetOrders();
                        },
                        function (err) {
                            log.error('Failed to Update the item qty.');
                            log.debug(err);
                            result = $q.reject(err);
                        });
                return result;
            }

            function schedule(deliveryDate, orderUUID) {
                var updatedItems = getUpdatedItems('schedule');
                var scheduleData = {
                    deliveryDate: deliveryDate,
                    orderUUID: orderUUID,
                    items: updatedItems
                };

                var result = DialogService.openDialogDeliveryScheduler(scheduleData);

                result.then(function () {
                    log.info('Scheduler Order Derlivery!');
                    $scope.selected.tab = 'toBeDelivered';
                    $scope.resetOrders();
                }, function (err) {
                    result = $q.reject(err);
                });
                return result;
            }

            function convertToUTC(dt) {
                var localDate = new Date(dt);
                var localTime = localDate.getTime();
                var localOffset = localDate.getTimezoneOffset() * 60000;
                return new Date(localTime + localOffset);
            }

            function twoDigitsLimit(value, limit) {
                var result = value;
                if (value > limit) {
                    result = limit;
                }

                if (result.length < 2) {
                    result = '0' + result;
                } else if (result.length === 3) {
                    result = result.slice(1);
                }

                return result;
            }

            // #####################################################################################################
            // Scope variables
            // #####################################################################################################
            $scope.schedule = {
                hour: TODAY.getHours(),
                minute: TODAY.getMinutes()
            };
            $scope.dtFilter = {
                deliveryDate: setTime(new Date(), 0, 0, 0, 0),
                minDate: setTime(new Date(), 0, 0, 0, 0)
            };
            $scope.ticket = {};
            $scope.ticket.watchedQty = {};

            $scope.disableConfirm = true;
            $scope.isDelivery = true;

            // #####################################################################################################
            // Scope Functions
            // #####################################################################################################

            $scope.confirm = function () {
                var dialogData = {
                    title: 'Entrega de produtos',
                    message: 'Confirmar a entrega dos produtos?',
                    btnYes: 'Sim',
                    btnNo: 'Não'
                };

                var deliveryDate = setTime(angular.copy($scope.dtFilter.deliveryDate), 0, 0, 0, 0);
                var actualDate = setTime(new Date(), 0, 0, 0, 0);

                var result = null;
                if (deliveryDate.getTime() === actualDate.getTime()) {
                    result = DialogService.messageDialog(dialogData).then(function () {
                        result = delivery();
                    });
                } else {
                    result = schedule($scope.dtFilter.deliveryDate, $scope.selectedOrder.uuid);
                }
                return result;
            };

            $scope.cancel = function () {
                $scope.selectedOrder.selectedOrderProducts = {};
                $scope.selected.tab = 'toBeDelivered';
            };

            // #####################################################################################################
            // Watchers
            // #####################################################################################################

            $scope.$watch('dtFilter.deliveryDate', function (newVal, oldVal) {
                var today = $scope.dtFilter.minDate;

                var isToday = newVal.getDate() === today.getDate() &&
                    newVal.getMonth() === today.getMonth() &&
                    newVal.getFullYear() === today.getFullYear();

                if (isToday) {
                    $scope.schedule.hour = new Date().getHours();
                    $scope.schedule.minute = new Date().getMinutes();
                }

                $scope.isDelivery = isToday;
            });

            $scope.$watchCollection('schedule', function () {
                $scope.schedule.hour = twoDigitsLimit($scope.schedule.hour, 23);
                $scope.schedule.minute = twoDigitsLimit($scope.schedule.minute, 59);

                $scope.dtFilter.deliveryDate = setTime($scope.dtFilter.deliveryDate, $scope.schedule.hour, $scope.schedule.minute, 0, 0);
            });

            $scope.$watchCollection('ticket.watchedQty', function (newVal, oldVal) {
                var productsToBeDeliveredQty = 0;
                for (var ix in $scope.ticket.watchedQty) {
                    productsToBeDeliveredQty += $scope.ticket.watchedQty[ix];
                }
                if (productsToBeDeliveredQty > 0) {
                    $scope.disableConfirm = false;
                } else {
                    $scope.disableConfirm = true;
                }
            });

            // #####################################################################################################
            // Warmup
            // #####################################################################################################


            var scheduledDate = null;
            if ($scope.selectedOrder.schedule) {
                scheduledDate = new Date($scope.selectedOrder.schedule.date);

                for (var ix in $scope.selectedOrder.selectedOrderProducts) {
                    var product = $scope.selectedOrder.selectedOrderProducts[ix];
                    var sProduct = ArrayUtils.find($scope.selectedOrder.schedule.items, 'id', product.id);
                    if (sProduct) {
                        $scope.ticket.watchedQty[ix] = sProduct.sQty;
                    }
                }
            } else {
                scheduledDate = new Date();
            }
            $scope.dtFilter.deliveryDate = setTime(scheduledDate, 0, 0, 0, 0);

        },
        [
            '$scope',
            '$q',
            '$filter',
            'logger',
            'OrderService',
            'StockService',
            'BookService',
            'DialogService',
            'SchedulingService',
            'ArrayUtils'
        ]);
})(angular);
