(function (angular) {
    'use strict';

    angular.module(
        'tnt.catalog.productsDelivery.service',
        [
            'tnt.catalog.order.service',
            'tnt.catalog.entity.service',
            'tnt.catalog.stock.service',
            'tnt.catalog.scheduling.service'
        ]).service(
        'ProductsDeliveryService',
        [
            '$filter',
            'OrderService',
            'EntityService',
            'StockService',
            'SchedulingService',
            function ProductsDeliveryService ($filter, OrderService, EntityService, StockService,
                SchedulingService) {

                this.listOrdersByReportType =
                    function (type) {
                        var orders = OrderService.list();
                        orders = prepareOrders(orders, 'toBeDelivered');
                        if (type === 'toBeDelivered') {
                            orders = $filter('filter')(orders, function (order) {
                                return order.totalItems !== order.totalItemsDeliv;
                            });
                        } else if (type === 'delivered') {
                            orders = prepareOrders(orders, 'delivered');
                            orders =
                                $filter('filter')(
                                    orders,
                                    function (order) {
                                        return order.totalItems === order.totalItemsDeliv &&
                                            order.totalItems > 0;
                                    });
                        }

                        return orders;
                    };

                function prepareOrders (orders, type) {
                    for ( var ix in orders) {
                        var order = orders[ix];
                        var entity = EntityService.read(order.customerId);
                        
                        if(type === 'toBeDelivered'){
                            order.schedule = SchedulingService.readActiveByDocument(order.uuid);
                        }else if (type === 'delivered'){
                            order.schedule = SchedulingService.readDeliveredByDocument(order.uuid);
                        }
                        
                        var totalScheduled = 0;
                        if(order.schedule){
                            for(var ix in order.schedule.items){
                                item = order.schedule.items[ix];
                                var sQty = item.sQty | 0;
                                totalScheduled += sQty;
                            }
                        }
                        order.totalItemsScheduled = totalScheduled;
                        order.customerName = entity.name;
                        order.phone = entity.phones[0].number;
                        order.totalItems = 0;
                        order.totalItemsDeliv = 0;
                       

                        order.items = $filter('filter')(order.items, function (item) {
                            return item.type ? false : true;
                        });
                        var totalRemaining =0;
                        for ( var ix2 in order.items) {
                            var item = order.items[ix2];

                            if (!item.dQty) {
                                item.dQty = 0;
                            }

                            order.totalItems += item.qty;
                            order.totalItemsDeliv += item.dQty;
                            totalRemaining += (item.qty - item.dQty);
                        }
                        order.totalRemaining = totalRemaining;
                    }
                    return orders;
                }
            }
        ]);
}(angular));
