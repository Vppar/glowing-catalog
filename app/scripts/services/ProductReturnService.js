(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.productReturn.service',
            [
                'tnt.catalog.productReturn.entity', 'tnt.catalog.productReturn.keeper', 'tnt.catalog.entity.service',
                'tnt.catalog.inventory.keeper', 'tnt.utils.array', 'tnt.catalog.stock.keeper'
            ]).service(
            'ProductReturnService',
            function ProductReturnService(ProductReturn, ProductReturnKeeper, EntityService, VoucherService, InventoryKeeper, ArrayUtils,
                    StockKeeper) {

                this.add = function(inventoryId, quantity, price, entityId) {

                    // is it a valid entity?
                    var entity = EntityService.find(entityId);
                    if (entity === undefined) {
                        throw 'invalid entity.';
                    }

                    // inventoryId
                    var product = ArrayUtils.find(InventoryKeeper.read(), 'id', inventoryId);

                    if (product === null) {
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

                    // <- create ProductReturn
                    var productReturn = new ProductReturn(null, productId, quantity, price);
                    ProductReturnKeeper.add(productReturn);

                    // <- top up Stock(use the current cost)

                    var stock = new Stock(inventoryId, quantity, product.price);
                    StockKeeper.add(stock);

                    // <- create voucher(linked to the return)
                    /**
                     * TODO - link the voucher to the return operation.
                     */
                    var amount = price * quantity;
                    var remarks = {};
                    VoucherService.create(entity, amount, remarks, document);

                };

            });
})(angular);