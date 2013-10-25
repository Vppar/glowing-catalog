(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').service('OrderService', function OrderService($filter, DataProvider) {

        this.order = {};
        var order = this.order;

        this.filterQty = function filterQty(item) {
            return Boolean(item.qty);
        };
        var filterQty = this.filterQty;

        this.getBasket = function getBasket() {
            var basketProducts = $filter('filter')(DataProvider.products, filterQty);
            return basketProducts;
        };
        var getBasket = this.getBasket;

        this.createOrder = function createOrder() {
            // Empty the basket.
            var basket = getBasket();
            for ( var idx in basket) {
                delete basket[idx].qty;
            }

            // Remove the selected customer.
            delete order.customerId;
        };

        this.placeOrder = function placeOrder() {
            var payment = angular.copy(DataProvider.currentPayments);
            payment.id = DataProvider.payments.length + 1;
            payment.customerId = order.customerId;
            DataProvider.payments.push(payment);

            // FIXME - Remove this piece of code, this must be done by the
            // server. (Id, date and code)
            order.id = DataProvider.orders.length + 1;
            order.date = new Date();
            order.code = 'mary-' + ('0000' + order.id).slice(-4) + '-' + String(order.date.getFullYear()).slice(-2);

            order.paymentId = payment.id;
            order.items = angular.copy(getBasket());

            DataProvider.orders.push(angular.copy(order));
        };

        this.removeItem = function removeItem(item) {
            var products = $filter('filter')(DataProvider.products, function(product) {
                var result = (product.id === item.id);
                return result;
            });
            delete products[0].qty;
        };

        this.hasCustomer = function hasCustomer() {
            return Boolean(order.customerId);
        };

    });
}(angular));