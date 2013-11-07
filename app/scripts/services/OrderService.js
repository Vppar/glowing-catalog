(function(angular) {
    'use strict';
    angular.module('tnt.catalog.order', [
        'tnt.catalog'
    ]).service('OrderService', function OrderService($filter, DataProvider) {
        var orderTemplate = {
            items : []
        };
        /**
         * The current order, only visible here, no one should be able to see it
         * directly much less change it, capiche?
         */
        var order = {};
        
        /**
         * Exposes the basket.
         */
        var getBasket = function getBasket() {
            return order.items;
        };
        /**
         * Adds an item to the basket.
         */
        var addToBasket = function addToBasket(product) {
            order.items.push(product);
        };
        /**
         * Creates a brand new order.
         */
        var createOrder = function createOrder() {
            order = angular.copy(orderTemplate);
        };
        createOrder();
        
        /**
         * Get the current order and add to the list of orders.
         */
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
        /**
         * Removes an item of the basket.
         */
        var removeFromBasket = function removeFromBasket(productId) {
            var product = $filter('findBy')(order.basket, 'id', productId);
            var idx = order.basket.indexOf(product);
            order.items.splice(idx, 1);
        };
        /**
         * Informs if the current order has a customer associated to it.
         */
        var hasCustomer = function hasCustomer() {
            return Boolean(order.customerId);
        };
        /**
         * Sets the order customer.
         */
        var setCustomerId = function setCustomerId(id) {
            order.customerId = id;
        };
        
        this.getData = function(){
            return DataProvider.ugauga;
        };

        /**
         * Exposes the methods to outside world.
         */
        this.getBasket = getBasket;
        this.addToBasket = addToBasket;
        this.removeFromBasket = removeFromBasket;
        this.setCustomerId = setCustomerId;
        this.hasCustomer = hasCustomer;
        this.placeOrder = placeOrder;
        this.createOrder = createOrder;
        // its here just for test purposes.
        this.order = order;
    });
}(angular));