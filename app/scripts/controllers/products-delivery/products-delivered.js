'use strict';

angular.module('tnt.catalog.productsDelivered', [
    'tnt.catalog.user', 'tnt.catalog.order.service'
]).controller('ProductsDeliveredCtrl', [
    '$scope', '$filter', function ($scope, $filter) {

        var originalDelivered = $scope.delivered;
        $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);

        $scope.getItems = function (order) {
            $scope.selectedOrder.selectedOrderProducts = getPendingProducts(order);
            $scope.selected.tab = 'deliveredProducts';
        };

        // #################################################################################################################
        // Pending Items
        // #################################################################################################################

        var getPendingProducts = function getPendingProducts (order) {
            var pendingProducts = [];
            $scope.selectedOrder.uuid = order.uuid;
            $scope.selectedOrder.customerName = order.customerName;
            $scope.selectedOrder.phone = order.phone;
            $scope.selectedOrder.schedule = order.schedule;
            for ( var ix in order.items) {
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

        $scope.$watchCollection('dtFilter', function () {
            $scope.delivered = filterProductsByDate(originalDelivered);
            $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);
        });

        $scope.$watchCollection('nameFilter', function (newVal, oldVal) {
            if (newVal.name.length > 3) {
                var orders = filterProductsByDate(originalDelivered);
                $scope.delivered = filterProductsByName(orders);
                $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);
            } else {
                $scope.delivered = filterProductsByDate(originalDelivered);
                $scope.sumarizatorOrders($scope.delivered, $scope.deliveredOrdersTotals);
            }
        });

        // #################################################################################################################
        // Date filter stuff
        // #################################################################################################################
        function setTime (date, hours, minutes, seconds, milliseconds) {
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(seconds);
            date.setMilliseconds(milliseconds);
            return date;
        }

        function filterProductsByDate (products) {
            return angular.copy($filter('filter')(products, filterByDate));
        }

        function filterProductsByName (orders) {
            return angular.copy($filter('filter')(orders, filterByName));
        }

        function filterByName (order) {
            var clientName = $scope.nameFilter.name.toLowerCase();

            if (clientName === '') {
                return true;
            } else {
                if (order.customerName.toLowerCase().indexOf(clientName) >= 0) {
                    return true;
                } else {
                    return false;
                }
            }
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
            
            if(!order.schedule){
                return true;
            }
            
            if (initialFilter && finalFilter) {
                if (order.schedule.date >= initialFilter && order.schedule.date <= finalFilter) {
                    return true;
                }
                return false;
            } else if (initialFilter) {
                if (order.schedule.date >= initialFilter) {
                    return true;
                }
                return false;
            } else if (finalFilter) {
                if (order.schedule.date <= finalFilter) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        }
    }
]);
