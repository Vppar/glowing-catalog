(function(angular) {
    'use strict';

    /**
     * The Inventory item. A product with an applied grid or a proper SKU
     * 
     * <pre>
     * @test Inventory.constructor#1
     * Validate the data on the returned object
     * 
     * @test Inventory.constructor#2
     * Validate the read only fields
     * 
     * </pre>
     */
    angular.module('tnt.catalog.inventory.entity', []).factory('Inventory', function Inventory() {
        var service = function svc(id) {

            if (arguments.length != svc.length) {
                throw 'Inventory must be initialized with an id';
            }

            ObjectUtils.ro(this, 'id', id);
        };

        return service;
    });

    /**
     * The Inventory item, same as SKU or a product with an applied grid
     */
    angular.module('tnt.catalog.inventory.keeper', ['tnt.utils.array']).service('InventoryKeeper', ['Inventory', 'ArrayUtils', function InventoryKeeper(Inventory, ArrayUtils) {
        var inventory = [];
        
        /**
         * <pre>
         * @spec InventoryKeeper.build#1
         * Given a valid list of products
         * When a build is triggered
         * Then the inventory must be populated with squashed products
         * and the product's property <id> must be read only
         * 
         * @spec InventoryKeeper.build#2
         * Given an invalid list of products
         * When a build is triggered
         * Then the inventory must be empty
         * 
         * </pre>
         * 
         * This function populate the inventory with squashed products
         * 
         * @param The product list
         */
        this.build = function(products){
            var product = null;
            for(var ix in products){
                product = products[ix];
                if(product.active){
                    product = this.squash(product, products);
                    
                    var item = new Inventory(product.id);
                    
                    delete product.id;
                    
                    angular.extend(item, product);
                    
                    inventory.push(item);
                }
            }
        };
        
        /**
         * <pre>
         * @spec InventoryKeeper.squash#1
         * Given a valid product
         * and a valid list of products
         * When a squash is triggered
         * Then the product must be returned containing extra parent's data 
         * 
         * @spec InventoryKeeper.squash#2
         * Given a valid product
         * and a non-parent products list
         * When a squash is triggered
         * Then null must be returned
         * 
         * @spec InventoryKeeper.squash#3
         * Given an invalid product
         * When a squash is triggered
         * Then null must be returned
         * 
         * @spec InventoryKeeper.squash#4
         * Given an invalid list of products
         * When a squash is triggered
         * Then null must be returned
         * 
         * </pre>
         * 
         * Squashes the whole product definition hierarchy into an inventory item. 
         * 
         * @param product - the product we want to be augumented
         * @param products - the list of products containing the parents to be squashed upon
         * 
         * @return {} - the product augumented by the data contained in the parents
         */
        this.squash = function(product, products){
            product = angular.copy(product);
            var parent = product;
            if(angular.isDefined(product.parent)){
                parent = ArrayUtils.find(products, 'id', product.parent);
                
                parent = this.squash(parent, products);
                
                delete parent.image;
                
                angular.extend(parent, product);
            }
            return parent;
        };
        
        this.read = function(){
            return angular.copy(inventory);
        };
    }]);
    
    angular.module('tnt.catalog.inventory', ['tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper']);
})(angular);