(function (angular) {
    'use strict';

    angular.module('tnt.catalog.productsDelivery', [
        'tnt.catalog.user', 'tnt.catalog.order.service', 'tnt.catalog.productsDelivery.service'
    ]).controller(
        'ProductsDeliveryCtrl',
        [
            '$scope',
            '$filter',
            'ArrayUtils',
            'UserService',
            'logger',
            'ProductsDeliveryService',
            function ($scope, $filter, ArrayUtils, UserService, logger, ProductsDeliveryService) {

                var log = logger.getLogger('tnt.catalog.productsDelivery.ProductsDeliveryCtrl');

                UserService.redirectIfInvalidUser();
                $scope.toBeDelivered = [];
                $scope.delivered = [];
                $scope.toBeDeliveredOrdersTotals = [];
                $scope.deliveredOrdersTotals = [];
                // Selected Order
                $scope.selectedOrder = {
                    uuid : null,
                    selectedOrderProducts : {},
                    customerName : '',
                    customerPhone : '',
                    created : null

                };

                $scope.dtFilter = {
                    dtInitial : setTime(new Date(), 0, 0, 0, 0),
                    dtFinal : new Date(),
                    dtMax : setTime(new Date(), 0, 0, 0, 0)
                };

                $scope.nameFilter = {
                    name : ''
                };

                function setTime (date, hours, minutes, seconds, milliseconds) {
                    date.setHours(hours);
                    date.setMinutes(minutes);
                    date.setSeconds(seconds);
                    date.setMilliseconds(milliseconds);
                    return date;
                }

                // selected tab
                $scope.selected = {
                    tab : 'toBeDelivered'
                };

                // #################################################################################################################
                // Sumarizator template
                // #################################################################################################################

                var ordersSumarizatorTemplate = {
                    enitityCount : 0,
                    orders : 0,
                    delivered : 0,
                    products : 0,
                    remaining : 0,
                    totalItemsScheduled : 0
                };

                $scope.resetOrders =
                    function () {
                        // Order by to be delivery
                        $scope.toBeDelivered = orderList(
                            ProductsDeliveryService.listOrdersByReportType('toBeDelivered'), 'toBeDelivered');
                        $scope.delivered = orderList(
                            ProductsDeliveryService.listOrdersByReportType('delivered'), 'delivered');
                    };

                function orderList(list, type){
                         var withScheduling = $filter('filter')(list, function (item) {
                            return item.schedule !== null;
                        });

                        var withoutScheduling = $filter('filter')(list, function (item) {
                            return item.schedule === null;
                        });
                        if(type === 'toBeDelivered'){
                            withScheduling = $filter('orderBy')(withScheduling, 'schedule.date');
                        }else{
                            withScheduling = $filter('orderBy')(withScheduling, '-schedule.date');
                        }
                        withoutScheduling = $filter('orderBy')(withoutScheduling, 'created');
                        return  withScheduling.concat(withoutScheduling);
                }
                // #################################################################################################################
                // Aux functions
                // #################################################################################################################
                var warmUp = function () {
                    angular.extend($scope.toBeDeliveredOrdersTotals, ordersSumarizatorTemplate);
                    angular.extend($scope.deliveredOrdersTotals, ordersSumarizatorTemplate);
                    $scope.resetOrders();
                };
                warmUp();

                $scope.sumarizatorOrders =
                    function (orders, summarizator) {
                        summarizator.orders = orders.length;
                        summarizator.enitityCount =
                            ArrayUtils.distinct(orders, 'customerId').length;
                        summarizator.remaining = $filter('sum')(orders, 'totalRemaining');
                        summarizator.products = $filter('sum')(orders, 'totalItems');
                        summarizator.delivered = $filter('sum')(orders, 'totalItemsDeliv');
                        summarizator.totalItemsScheduled =
                            $filter('sum')(orders, 'totalItemsScheduled');
                    };

                $scope.sumarizatorProducts = function (items, summarizator) {
                    summarizator.total = $filter('sum')(items, 'qty');
                    summarizator.delivered = $filter('sum')(items, 'dQty');
                };
            }
        ]);
})(angular);
