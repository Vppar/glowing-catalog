(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.productReturn.service',
            [
                'tnt.catalog.productReturn.entity', 'tnt.catalog.productReturn.keeper', 'tnt.catalog.entity.service',
                'tnt.catalog.inventory.keeper', 'tnt.utils.array', 'tnt.catalog.stock.keeper', 'tnt.catalog.stock.entity'
            ]).service(
            'ProductReturnService',
            function ProductReturnService($q, $log, ProductReturn, ProductReturnKeeper, EntityService, InventoryKeeper, ArrayUtils,
                  StockKeeper, Stock) {
            
//            function ProductReturnService(ProductReturn, ProductReturnKeeper, EntityService, VoucherService, InventoryKeeper, ArrayUtils,
//                    StockKeeper, Stock) {
//
//                this.returnProduct = function(inventoryId, quantity, price, entityId, remarks, document) {
//
//                    // is it a valid entity?
//                    var entity = EntityService.find(entityId);
//                    if (entity === null) {
//                        throw 'invalid entity.';
//                    }
//
//                    // inventoryId
//                    var product = ArrayUtils.find(InventoryKeeper.read(), 'id', inventoryId);
//
//                    if (product === null) {
//                        throw 'invalid productId.';
//                    }
//
//                    // quantity
//                    if (quantity <= 0) {
//                        throw 'invalid amount. The valaue can not be negative.';
//                    }
//
//                    // price
//                    if (price <= 0) {
//                        throw 'invalid price. The valaue can not be negative.';
//                    }
//
//                    // <- create ProductReturn
//                    var productReturn = new ProductReturn(null, inventoryId, quantity, price);
//                    ProductReturnKeeper.add(productReturn);
//
//                    // <- top up Stock(use the current cost)
//
//                    var stock = new Stock(inventoryId, quantity, product.price);
//                    StockKeeper.add(stock);
//
//                    // <- create voucher(linked to the return)
//                    /**
//                     * TODO - link the voucher to the return operation.
//                     */
//                    var amount = price * quantity;
//                    VoucherService.create(entity, amount, remarks, document);
//
//                };
                
                // FIXME - make it validate!
                var isValid = function isValid(productReturn) {
                   var result = [];
                   return result;
                };
                
                var register = function register(productReturn) {
                    var result = null;
                    var hasErrors = isValid(productReturn);
                    if (hasErrors.length === 0) {
                        result = ProductReturnKeeper.add(new ProductReturn(productReturn));
                    } else {
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };
                
                var bulkRegister = function(exchanges, entity, document) {
                    var exchangesPromises = [];
                    for ( var ix in exchanges) {
                        var exchange = exchanges[ix];
                        //FIXME maybe review this
                        if (exchange.amount > 0) {
                           
                            var productReturn = new ProductReturn({
                                    id:exchange.id,
                                    productId:exchange.productId,
                                    quantity:exchange.qty,
                                    cost:exchange.price
                            });
                            
                            exchangesPromises[ix] = register(productReturn);
                        } else {
                            $log.warn('Product return will be ignored because its amount is 0: ' + JSON.stringify(exchange));
                        }
                    }
                    return $q.all(exchangesPromises);
                };
                
                var list = function list(){
                    return ProductReturnKeeper.list();
                };
                
                
                this.bulkRegister = bulkRegister;
                this.register = register;
                this.isValid = isValid;
                this.list = list;
            });
})(angular);