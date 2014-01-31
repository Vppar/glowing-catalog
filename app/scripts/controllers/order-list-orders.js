(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.orders.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListOrdersCtrl', function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider) {
        
        var entities = $scope.entities;
        
        for ( var ix in $scope.filteredOrders) {
            var order = $scope.filteredOrders[ix];
            // Find the entity name
            order.entityName = ArrayUtils.find(entities, 'id', order.customerId).name;
            // Calc the
            var qtyTotal = $filter('sum')(order.items, 'qty');
            order.amountTotal = $filter('sum')(order.items, 'price', 'qty');
            order.avgPrice = (order.amountTotal) / (qtyTotal);
        }
        
    });
}(angular));