(function(angular, alert) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'DeliveryDetailsDialogCtrl',
            function($scope, $filter, $timeout, dialog, DataProvider) {

                // #############################################################################################################
                // Local variables and functions
                // #############################################################################################################
                var delivery = {
                    items : []
                };
                var order = dialog.data.order;
                var timewatcher = {};

                // #############################################################################################################
                // Scope variables and functions
                // #############################################################################################################

                $scope.item = {
                    qty : 0,
                    remaining : 0
                };
                $scope.order = order;
                $scope.delivery = delivery;

                $scope.selectOrderItem = function selectOrderItem(itemId) {
                    $scope.item.remaining = $filter('filter')(delivery.orderItems, function(item) {
                        return item.id === Number(itemId);
                    })[0].remaining;
                    $scope.item.qty = $scope.item.remaining;
                };

                $scope.itemsRemainingFilter = function itemsRemainingFilter(item) {
                    return item.remaining > 0;
                };

                $scope.addToDelivery = function(item) {
                    var filteredItems = $filter('filter')(delivery.items, function(product) {
                        return Boolean(product.id === Number(item.id));
                    });

                    if (filteredItems.length === 0) {
                        var filteredProducts = $filter('filter')(DataProvider.products, function(product) {
                            return Boolean(product.id === Number(item.id));
                        });
                        var deliveryItem = angular.copy(filteredProducts[0]);
                        deliveryItem.qty = item.qty;
                        delivery.items.push(deliveryItem);

                        var filteredOrderItems = $filter('filter')(delivery.orderItems, function(product) {
                            return Boolean(product.id === Number(item.id));
                        });
                        filteredOrderItems[0].remaining = filteredOrderItems[0].remaining - item.qty;
                        filteredOrderItems[0].qty = filteredOrderItems[0].remaining;

                        var filteredOrderProducts = $filter('filter')(delivery.orderItems, $scope.itemsRemainingFilter);

                        if (filteredOrderProducts.length > 0) {
                            angular.extend(item, filteredOrderProducts[0]);
                        } else {
                            item.id = 0;
                            item.qty = 0;
                            item.remaining = 0;
                            item.titte = 0;
                        }
                    }
                };

                $scope.removeFromDelivery = function(index) {
                    var item = $scope.delivery.items[index];
                    var filteredOrderItems = $filter('filter')(delivery.orderItems, function(product) {
                        return Boolean(product.id === Number(item.id));
                    });
                    filteredOrderItems[0].remaining = filteredOrderItems[0].remaining + Number(item.qty);
                    filteredOrderItems[0].qty = filteredOrderItems[0].remaining;

                    angular.extend($scope.item, filteredOrderItems[0]);

                    delivery.items.splice(index, 1);
                };

                $scope.hourChange =
                        function hourChange() {
                            if (delivery.hour && delivery.hour.length === 4) {
                                delivery.datetime =
                                        new Date(
                                                delivery.datetime.getFullYear(), delivery.datetime.getMonth(), delivery.datetime.getDate(),
                                                delivery.hour.substring(0, 2), delivery.hour.substring(2, 4));
                            }
                        };

                $scope.cancel = function() {
                    $timeout.cancel(timewatcher);
                    dialog.close(false);
                };
                $scope.save =
                        function() {
                            if (delivery.items.length === 0) {
                                alert('Não é possivel agendar uma entrega sem itens.');
                                return;
                            }

                            // Get the timestamp from date picker and merge with
                            // the informed hour
                            delivery.datetime = convertToUTC(delivery.datetime);
                            delivery.hour =
                                    new Date(
                                            delivery.datetime.getFullYear(), delivery.datetime.getMonth(), delivery.datetime.getDate(),
                                            delivery.hour.split(':')[0], delivery.hour.split(':')[1], delivery.hour.split(':')[2]);

                            delivery.orderId = order.id;
                            delivery.status = 'scheduled';
                            delivery.items = angular.copy(delivery.items);

                            if (delivery.id) {
                                var recoveredDelivery = $filter('filter')(DataProvider.deliveries, function(item) {
                                    return item.id === delivery.id;
                                })[0];
                                angular.extend(recoveredDelivery, delivery);
                            } else {
                                delivery.id = DataProvider.deliveries.length + 1;
                                DataProvider.deliveries.push(angular.copy(delivery));
                            }

                            delete delivery.qty;
                            delete delivery.items;

                            $timeout.cancel(timewatcher);

                            dialog.close(delivery.datetime);
                        };

                $scope.deliver = function() {
                    if (delivery.items.length === 0) {
                        alert('Não é possivel registrar uma entrega sem itens.');
                        return;
                    }

                    delivery.datetime = convertToUTC(new Date());
                    delivery.orderId = order.id;
                    delivery.status = 'delivered';
                    delivery.items = angular.copy(delivery.items);

                    if (delivery.id) {
                        var recoveredDelivery = $filter('filter')(DataProvider.deliveries, function(item) {
                            return item.id === delivery.id;
                        })[0];
                        angular.extend(recoveredDelivery, delivery);
                    } else {
                        delivery.id = DataProvider.deliveries.length + 1;
                        DataProvider.deliveries.push(angular.copy(delivery));
                    }

                    delete delivery.qty;
                    delete delivery.items;

                    $timeout.cancel(timewatcher);

                    dialog.close('delivered');
                };

                function convertToUTC(dt) {
                    var localDate = new Date(dt);
                    var localTime = localDate.getTime();
                    var localOffset = localDate.getTimezoneOffset() * 60000;
                    return new Date(localTime + localOffset);
                }

                function timewatch() {
                    $scope.now = new Date();
                    timewatcher = $timeout(timewatch, 1000);
                }

                function main() {
                    // Set the default qty value based on the first product of
                    // the list.
                    for ( var idx in order.items) {
                        if (order.items[idx].remaining > 0) {
                            $scope.item.remaining = order.items[idx].remaining;
                            $scope.item.qty = $scope.item.remaining;
                            break;
                        }
                    }
                    if ($scope.order.selectedDelivery) {
                        delivery.id = $scope.order.selectedDelivery.id;
                        delivery.datetime = $scope.order.selectedDelivery.datetime;
                        delivery.status = $scope.order.selectedDelivery.status;
                        delivery.items = angular.copy($scope.order.selectedDelivery.items);
                    } else {
                        delivery.datetime = new Date();
                    }
                    delivery.hour = $filter('date')(delivery.datetime, 'HHmm');
                    delivery.orderItems = angular.copy($scope.order.items);

                    timewatch();
                }
                main();
            });
}(angular, window.alert));