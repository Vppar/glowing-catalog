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
    angular.module('tnt.catalog.inventory.keeper', []).service('InventoryKeeper', function InventoryKeeper(Inventory) {
        var inventory = [];
        
        /**
         * 
         * 
         * 
         * @param The product list
         */
        this.build = function(products){
            for(var ix in products){
                product = products[ix];
                
                if(product.active){
                    product = this.squash(product, products);
                    
                    var item = new Inventory(product.id);
                    
                    angular.extend(item, product);
                    
                    inventory.push(item);
                }
            }
        };
        
        /**
         * Squashes the whole product definition hierarchy into an inventory item. 
         * 
         * @param product - the product we want to be augumented
         * @param products - the list of products containing the parents to be squashed upon
         * 
         * @return {} - the product augumented by the data contained in the parents
         */
        this.squash = function(product, products){
            product = angular.copy(product);
            
            if(angular.isDefined(product.parent)){
                parent = ArrayUtils.find(products, 'id', product.parent);
                
                parent = this.squash(parent, products);
                
                angular.extend(parent, product);
            }
            return product;
        };
    });
    
    angular.module('tnt.catalog.inventory', ['tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper']);
})(angular);