(function(angular) {
    'use strict';

    angular.module('tnt.catalog.inventory.entity', []).factory('Inventory', function Product() {

    });

    angular.module('tnt.catalog.productReturn.keeper', [
        'tnt.utils.array'
    ]).service('ProductReturnKeeper', function InventoryKeeper(Inventory, ArrayUtils) {
        var inventoryList = [];

        /**
         * read inventoryList
         */
        this.read = fuction(){
            return inventoryList;
        };

        /**
         * add on inventoryList
         */
        this.add = function() {
            
        };

    });

    angular.module('tnt.catalog.inventory', [
        'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper'
    ]);
})(angular);