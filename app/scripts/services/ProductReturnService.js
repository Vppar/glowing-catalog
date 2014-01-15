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

                this.add = function(productId, quantity, price, entity) {
                    // is it a valid entity?
                    if (EntityService.find(entity) === undefined) {
                        throw 'invalid entity.';
                    }

                    // productId
                    if (angular.isUndefined(InventoryService.get(productId))) {
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

                    var productReturn = new ProductReturn(ProductReturnKeeper.read.length, productId, quantity, price);
                    ProductReturnKeeper.add(productReturn);

                    VoucherService.create(entity, amount, remarks, document);
                };

            });
})(angular);