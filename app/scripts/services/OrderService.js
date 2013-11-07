(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').service('OrderService', function OrderService($filter, DataProvider) {

        var order = {
            basket : []
        };
        var filterQty = function filterQty(item) {
            return Boolean(item.qty);
        };
        var getBasket = function getBasket() {
            return order.basket;
        };
        var addToBasket = function addToBasket(product) {
            order.basket.push(product);
        };
        var createOrder = function createOrder() {
            // Empty the basket.
            var basket = getBasket();
            for ( var idx in basket) {
                delete basket[idx].qty;
            }
            // Remove the selected customer.
            delete order.customerId;
        };
        var placeOrder = function placeOrder() {
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
        var removeFromBasket = function removeFromBasket(productId) {
            var product = $filter('findBy')(order.basket, 'id', productId);
            var idx = order.basket.indexOf(product);
            order.basket.splice(idx, 1);
        };
        var hasCustomer = function hasCustomer() {
            return Boolean(order.customerId);
        };
        var setCustomerId = function setCustomerId(id) {
            order.customerId = id;
        };

        this.filterQty = filterQty;
        this.getBasket = getBasket;
        this.addToBasket = addToBasket;
        this.removeFromBasket = removeFromBasket;
        this.setCustomerId = setCustomerId;
        this.hasCustomer = hasCustomer;
        this.placeOrder = placeOrder;
        this.createOrder = createOrder;
    });
}(angular));