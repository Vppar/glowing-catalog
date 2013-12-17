(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.product', [
        'tnt.catalog.service.storage'
    ]).service('ProductService', function ProductService($log,StorageService) {
        
        var storage = StorageService;
        
        //an easy acess to products
        var name = 'products';
        
        
        var inventoryAdd = function inventoryAdd(id, price, qty) {
            
            var result = undefined;
            
            if(price > 0 && qty > 0){
                
                var product = storage.get(name,id);
                
                if(product){
                    var updatedQty = qty+product.quantity;
                    var average = (qty*price)+(product.quantity*product.price)/updatedQty;
                    product.price = average;
                    product.quantity = updatedQty;
                    
                    storage.update(name,product);
                    
                    result = product;
                }
            }else{
                
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
        }
        
        /**
         * Function that returns a product by id.
         * 
         * @param id - A product id.
         * 
         * @return - the correspondent product or undefined
         */
        var get = function get(id){
            var product = storage.get(name,id);
            if(!product){
                $log.error('ProductService.get: -Product not found, id=' + id);
            }
            return product;
        };
        
        
        
        
        
        this.get = get;
        this.list = list;
        this.inventoryAdd = inventoryAdd;
    });

}(angular));