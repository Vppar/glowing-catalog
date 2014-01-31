(function(angular) {
    'use strict';
    angular.module('tnt.catalog.orderList.clients.ctrl', [
        'tnt.catalog.order.service', 'tnt.utils.array'
    ]).controller('OrderListClientsCtrl', function($scope, $location, $filter, OrderService, ArrayUtils, DataProvider) {

        //FIXME - Fábio - should be this on service?
        /**
         * Consolidate orders by client
         */
        $scope.ordersByCLientList = [];
        
        var entities = $scope.entities;
        
        //add a missing property for innerJoin
        for ( var idx in $scope.entities) {
            entities[idx].customerId = entities[idx].id;
        }
        
        var joinClientOrder = ArrayUtils.innerJoin(entities, $scope.filteredOrders, 'customerId');
        var distincsClients = ArrayUtils.distinct(joinClientOrder, 'customerId');
        var client = {};
        
        for ( var idx in distincsClients) {
            //list all orders of one client.
            var ordersByClient = ArrayUtils.filter(joinClientOrder, {
                customerId : distincsClients[idx]
            });
            //use the first of array for common information
            client = ordersByClient[0];
            var totalAmount = 0;
            var totalQuantity = 0;
            var lastOrder = 1;

            for ( var idy in ordersByClient) {
                totalAmount += $filter('sum')(ordersByClient[idy].items, 'price', 'qty');
                totalQuantity += $filter('sum')(ordersByClient[idy].items, 'qty');
                if (ordersByClient[idy].created > lastOrder) {
                    lastOrder = ordersByClient[idy].created;
                }
            }

            client.totalAmount = totalAmount;
            client.totalQuantity = totalQuantity;
            client.averagePrice = (totalAmount / totalQuantity);
            client.lastOrder = new Date(lastOrder);
            $scope.ordersByCLientList.push(client);
        }

    });
}(angular));