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
                        result['catch'](function(err) {
                            $log.error('ProductReturnService.register: -Failed to create a productReturn. ', err);
                        });
                    } else {
                        $log.error('ProductReturnService.register: -Invalid productReturn. ', hasErrors);
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
                                    documentId : document,
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
                
                /**
                 * Returns the full receivables list.
                 * 
                 * @return Array - Receivables list.
                 */
                var listByDocument = function listByDocument(document) {
                    var result = null;
                    try {
                        result = ArrayUtils.list(ProductReturnKeeper.list(), 'documentId', document);
                    } catch (err) {
                        $log.debug('ProductReturnKeeper.list: Unable to recover the list of receivables. Err=' + err);
                    }
                    return result;
                };
                
                this.bulkRegister = bulkRegister;
                this.register = register;
                this.isValid = isValid;
                this.list = list;
                this.listByDocument = listByDocument;
            });
})(angular);