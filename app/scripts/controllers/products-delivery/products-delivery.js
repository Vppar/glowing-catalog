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

                UserService.redirectIfIsNotLoggedIn();
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
                    totalItemsScheduled : 0,
                };

                var productsSumarizatorTemplate = {
                    total : 0,
                    delivered : 0,
                    actualDelivery : 0,
                };

                $scope.resetOrders =
                    function () {
                         var toBeDelivered =
                            ProductsDeliveryService.listOrdersByReportType('toBeDelivered');
                        var withScheduling = $filter('filter')(toBeDelivered, function(item){
                            return angular.isDefined(item.schedule);
                        });
                        var withoutScheduling = $filter('filter')(toBeDelivered, function(item){
                            return !angular.isDefined(item.schedule);
                        });
                        withScheduling = $filter('orderBy')(withScheduling, 'schedule.date');
                        withoutScheduling = $filter('orderBy')(withoutScheduling, 'created');
                        $scope.toBeDelivered = withScheduling.concat(withoutScheduling);
                        $scope.delivered =
                            ProductsDeliveryService.listOrdersByReportType('delivered');
                    };

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