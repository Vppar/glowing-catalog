(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.inventory', [
        'tnt.catalog.service.storage'
    ]).service('InventoryService', ['$log', 'StorageService', function InventoryService($log, StorageService) {

        var storage = StorageService;

        // an easy access to products
        var name = 'products';

        var remove = function remove(id, inv) {

            var product = storage.get(name, id);
            var result = false;
            if (product) {
                if (inv > 0) {
                    var updatedInv = product.inventory - inv;
                    product.inventory = updatedInv;
                    result = storage.update(name, product);
                } else {
                    $log.error('InvetoryService.remove: -Invalid inventory, inventory=' + inv);
                }
            }
            return result;

        };

        var add = function add(id, price, inv) {

            var result = false;
            var product = storage.get(name, id);

            if (price > 0 && inv > 0) {
                if (product) {

                    var updatedInv = inv + product.inventory;
                    var average = (inv * price) + (product.inventory * product.price) / updatedInv;
                    product.price = average;
                    product.inventory = updatedInv;

                    storage.update(name, product);

                    result = product;
                }

            } else {
                if (price <= 0) {
                    $log.error('InventoryService.add:  -Invalid price, price=' + price);
                } else if (inv <= 0) {
                    $log.error('InventoryService.add:  -Invalid inventory, inventory=' + inv);
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
    }]);

}(angular));