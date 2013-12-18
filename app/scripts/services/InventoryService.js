(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.inventory', [
        'tnt.catalog.service.storage'
    ]).service('InventoryService', function InventoryService($log, StorageService) {

        var storage = StorageService;

        // an easy access to products
        var name = 'products';

        var remove = function remove(id, qty) {

            var product = storage.get(name, id);
            var result = false;
            if (product) {
                if(qty>0){
                    var updatedQty = product.quantity - qty;
                    product.quantity = updatedQty;
                    result = storage.update(name, product);
                }else{
                    $log.error('InvetoryService.remove: -Invalid quantity, quantity=' + qty);
                }
            }               
            return result;

        };

        var add = function add(id, price, qty) {

            var result = false;
            var product = storage.get(name, id);

            if (price > 0 && qty > 0) {
                if (product) {

                    var updatedQty = qty + product.quantity;
                    var average = (qty * price) + (product.quantity * product.price) / updatedQty;
                    product.price = average;
                    product.quantity = updatedQty;

                    storage.update(name, product);

                    result = product;
                }

            } else {
                if (price <= 0) {
                    $log.error('InventoryService.add:  -Invalid price, price=' + price);
                } else if (qty <= 0) {
                    $log.error('InventoryService.add:  -Invalid quantity, quantity=' + qty);
                }

            }

            return result;
        };

        /**
         * Function that returns the product list
         * 
         * @return - the products list
         */
        var list = function list() {
            var products = storage.list(name);
            return products;
        };

        /**
         * Function that returns a product by id.
         * 
         * @param id - A product id.
         * 
         * @return - the correspondent product or undefined
         */
        var get = function get(id) {
            var product = storage.get(name, id);
            if (!product) {
                $log.error('InventoryService.get: -Product not found, id=' + id);
            }
            return product;
        };

        this.get = get;
        this.list = list;
        this.add = add;
        this.remove = remove;
    });

}(angular));