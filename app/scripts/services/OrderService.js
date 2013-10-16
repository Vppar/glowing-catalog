(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').service('OrderService', function OrderService($filter, DataProvider) {

        this.order = {};

        this.filterQty = function filterQty(item) {
            return Boolean(item.qty);
        };

        this.getBasket = function getBasket() {
            var basketProducts = $filter('filter')(DataProvider.products, this.filterQty);
            return basketProducts;
        };

        this.createOrder = function createOrder() {
            // Empty the basket.
            var basket = this.getBasket();
            for ( var idx in basket) {
                delete basket[idx].qty;
            }

            // Remove the selected customer.
            delete this.order.customerId;
        };

        this.removeItem = function removeItem(item) {
            var products = $filter('filter')(DataProvider.products, function(product) {
                var result = (product.id === item.id);
                return result;
            });
            delete products[0].qty;
        };

        this.hasCustomer = function hasCustomer() {
            return Boolean(this.order.customerId);
        };

    });
}(angular));