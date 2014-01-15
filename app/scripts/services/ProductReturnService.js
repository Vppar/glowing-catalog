(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.productReturn.service',
            [
                'tnt.catalog.productReturn.entity', 'tnt.catalog.productReturn.keeper', 'tnt.catalog.entity.service', 'tnt.utils.array',
                'tnt.catalog.service.inventory'
            ]).service(
            'ProductReturnService',
            function ProductReturnService(ProductReturn, ProductReturnKeeper, EntityService, VoucherService, InventoryService) {

                this.add = function(inventoryId, quantity, price, entityId) {
                    
                    // does the product exist?
                    // is the quantity sane?
                    // does the entity exist?
                    
                    // <- create ProductReturn
                    
                    // <- top up Stock(use the current cost)
                    
                    // <- create voucher(linked to the return)
                    
                    
                    // is it a valid entity?
                    if (EntityService.find(entity) === undefined) {
                        throw 'invalid entity.';
                    }

                    // inventoryId
                    if (angular.isUndefined(InventoryService.get(inventoryId))) {
                        throw 'invalid productId.';
                    }

                    // quantity
                    if (quantity <= 0) {
                        throw 'invalid amount. The valaue can not be negative.';
                    }

                    // price
                    if (price <= 0) {
                        throw 'invalid price. The valaue can not be negative.';
                    }

                    var productReturn = new ProductReturn(null, productId, quantity, price);
                    ProductReturnKeeper.add(productReturn);

                };

            });
})(angular);