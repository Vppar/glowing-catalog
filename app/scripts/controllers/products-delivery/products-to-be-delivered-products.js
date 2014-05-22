(function (angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBeDeliveryProducts', []).controller(
        'ProductsToBeDeliveryProductsCtrl',
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
            'ArrayUtils',
            function ($scope, $q, $filter, logger, OrderService, StockService, BookService, DialogService,
                SchedulingService, ArrayUtils) {

                var log = logger.getLogger('tnt.catalog.productsDelivery.ProductsDeliveryCtrl');
                $scope.disableConfirm = true;

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

                var scheduledDate = new Date();
                if ($scope.selectedOrder.schedule) {
                    scheduledDate = new Date($scope.selectedOrder.schedule.date);
                }

                $scope.schedule = {
                    hour : new Date().getHours(),
                    minute : new Date().getMinutes()
                };

                $scope.dtFilter = {
                    deliveryDate : setTime(scheduledDate, $scope.schedule.hour, $scope.schedule.minute, 0, 0, 0),
                    minDate : setTime(new Date(), 0, 0, 0, 0, 0)
                };

                $scope.ticket = {};
                $scope.ticket.watchedQty = {};
                $scope.isDelivery = true;

                $scope.$watchCollection('ticket.watchedQty', function (newVal, oldVal) {
                    var productsToBeDeliveredQty = 0;
                    for ( var ix in $scope.ticket.watchedQty) {
                        productsToBeDeliveredQty += $scope.ticket.watchedQty[ix];
                    }
                    if (productsToBeDeliveredQty > 0) {
                        $scope.disableConfirm = false;
                    } else {
                        $scope.disableConfirm = true;
                    }
                });

                $scope.$watchCollection('schedule',function(){
                    if($scope.schedule.minute>59){
                        $scope.schedule.minute = 59;
                    }
                    $scope.dtFilter.deliveryDate = setTime($scope.dtFilter.deliveryDate, $scope.schedule.hour, $scope.schedule.minute, 0, 0, 0);
                });
                
                $scope.$watch('dtFilter.deliveryDate',function(newVal, oldVal){
                    var today = $scope.dtFilter.minDate;
                    
                    var isToday = newVal.getDate() === today.getDate() && 
                                newVal.getMonth() === today.getMonth() &&
                                newVal.getFullYear() === today.getFullYear();
                    
                    if(isToday){
                        $scope.schedule.hour = new Date().getHours();
                        $scope.schedule.minute =  new Date().getMinutes();
                    }
                    
                    $scope.isDelivery = isToday;
                });

                $scope.confirm = function () {
                    var dialogData = {
                        title : 'Entrega de produtos',
                        message : 'Confirmar a entrega dos produtos?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    };
                    
                    var deliveryDate = angular.copy($scope.dtFilter.deliveryDate);
                    deliveryDate.setHours(0);
                    deliveryDate.setMinutes(0);
                    deliveryDate.setSeconds(0);
                    deliveryDate.setMilliseconds(0);

                    var actualDate = new Date();
                    actualDate.setHours(0);
                    actualDate.setMinutes(0);
                    actualDate.setSeconds(0);
                    deliveryDate.setMilliseconds(0);
                   
                    var result = null;
                    if (deliveryDate.getTime() === actualDate.getTime()) {
                        result = DialogService.messageDialog(dialogData).then(function() {
                            result = delivery();
                        });
                    } else {
                        result = schedule($scope.dtFilter.deliveryDate, $scope.selectedOrder.uuid);
                    }

                    return result;
                    
                };

                function warmup(){
                    if($scope.selectedOrder.schedule){
                        for(var ix in $scope.selectedOrder.selectedOrderProducts){
                            var product = $scope.selectedOrder.selectedOrderProducts[ix];
                            var sProduct = ArrayUtils.find($scope.selectedOrder.schedule.items,'id', product.id);
                            if(sProduct){
                                $scope.ticket.watchedQty[ix] = sProduct.sQty;
                            }
                        }
                    }
                    
                }
                warmup();
                
                function getUpdatedItems (type) {
                    var updatedItems = [];
                    for ( var ix in $scope.ticket.watchedQty) {
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

                function delivery () {
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

                function schedule (deliveryDate, orderUUID) {
                    var updatedItems = getUpdatedItems('schedule');
                    var scheduleData = {
                        deliveryDate : deliveryDate,
                        orderUUID : orderUUID,
                        items : updatedItems
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

                $scope.cancel = function () {
                    $scope.selectedOrder.selectedOrderProducts = {};
                    $scope.selected.tab = 'toBeDelivered';
                };

                var logistics =
                    function (orderUUID, updatedItems) {
                        var books = '';
                        var productAmount = 0;
                        var productCost = 0;
                        var stock = 0;
                        var order = OrderService.read($scope.selectedOrder.uuid);
                        var promises = [];
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
                                for ( var y in books) {
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

                    };

            }
        ]);
})(angular);
