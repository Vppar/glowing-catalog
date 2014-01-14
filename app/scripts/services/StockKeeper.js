(function(angular) {
    'use strict';

    /**
     * The amount in stock for a given Inventory item
     * 
     * <pre>
     * @test Stock.constructor#1
     * Validate the data on the returned object
     * 
     * @test Stock.constructor#2
     * Validate the read only fields
     * 
     * </pre>
     */
    angular.module('tnt.catalog.stock.entity', []).factory('Stock', function Stock() {

        var service = function svc(inventoryId, quantity, cost) {
            
            var validProperties = ['inventoryId', 'quantity', 'cost'];

            ObjectUtils.method(svc, 'isValid', function(){
                for(var ix in this){
                    var prop = this[ix];
                    
                    if(!angular.isFunction(prop)){
                        if(validProperties.indexOf(ix) === -1){
                            throw "Unexpected property " + ix; 
                        }
                    }
                }
            });
            
            if (arguments.length != svc.length) {
                if(arguments.length === 1 && angular.isObject(arguments[0])){
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Stock must be initialized with inventoryId, quantity and cost';
                }
            } else {
                this.inventoryId = inventoryId;
                this.quantity = quantity;
                this.cost = cost;
            }
            ObjectUtils.ro(this, 'inventoryId', this.inventoryId);
        };

        return service;
    });

    /**
     * The keeper for the current stock
     */
    angular.module('tnt.catalog.stock.keeper', ['tnt.utils.array']).service(
            'StockKeeper', function StockKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Stock) {

                var currentEventVersion = 1;
                var stock = [];
                this.handlers = {};

                /**
                 * <pre>
                 * @spec StockKeeper.handlers.stockAddV1#1
                 * Given a valid event
                 * and an existing productId
                 * when an add is triggered
                 * then the position must be updated
                 * and the quantity must be the sum
                 * and the price must be the average
                 * 
                 * @spec StockKeeper.handlers.stockAddV1#2
                 * Given a valid event 
                 * and a non existent productId
                 * when an add is triggered
                 * the a new entry must be added
                 * and it must be an instance of Stock
                 * 
                 * @spec StockKeeper.handlers.stockAddV1#3
                 * Given an invalid event
                 * when an add is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Add replay function for event version 1
                 * 
                 * This function applies the changes received from the journal.
                 * 
                 * @param event - something that resembles, but not necessarily is, an instance of Stock
                 */
                ObjectUtils.ro(this.handlers, 'stockAddV1', function(event) {
                    var entry = ArrayUtils.find(stock, 'productId', event.productId);

                    if (entry === null) {
                        event = new Stock(event);
                        stock.push(event);
                    } else {
                        var updatedInv = entry.quantity + event.quantity;
                        var average = (entry.quantity * entry.price) + (event.quantity * event.price) / updatedInv;
                        entry.price = average;
                        entry.quantity = updatedInv;
                    }
                });

                /**
                 * <pre>
                 * @spec StockKeeper.handlers.stockRemoveV1#1
                 * Given a valid event
                 * and an existing productId
                 * when a remove is triggered
                 * then the entry quantity must be subtracted by the given amount
                 * 
                 * @spec StockKeeper.handlers.stockRemoveV1#2
                 * Given a valid event
                 * and a non existing productId
                 * when a remove is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Remove replay function for event version 1
                 * 
                 * This function applies the changes received from the journal.
                 * 
                 * @param event - something that resembles, but not necessarily is, an instance of Stock
                 */
                ObjectUtils.ro(this.handlers, 'stockRemoveV1', function(event) {
                    
                    var entry = ArrayUtils.find(stock, 'productId', event.productId);

                    if (entry === null) {
                        throw 'Entity not found, cosistency must be broken! Replay?';
                    }
                    
                    entry -= event.quantity;
                });

                // Registering the handlers with the Replayer
                Replayer.registerHandlers(this.handlers);

                /**
                 * <pre>
                 * @spec StockKeeper.add#1
                 * Given a valid productId
                 * and a positive quantity
                 * and a valid cost
                 * when and add is triggered
                 * then a journal entry must be created
                 * an the entry must be registered
                 * 
                 * @spec StockKeeper.add#2
                 * Given a negative quantity
                 * when and add is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Register an addition of products to the stock
                 * 
                 * @param productId - The id for the product we are fiddling with
                 * @param quantity - the number of units we are pulling in
                 * @param cost - unary cost for the product we are pulling in 
                 */
                
                
                this.add = function(stock) {
                    
                    if(stock instanceof Stock){
                        stock.isValid();
                    } else {
                        throw "Wrong instance bitch";
                    }
                    
                    var stamp = (new Date()).getTime() / 1000;
                    // create a new journal entry
                    var entry = new JournalEntry(null, stamp, 'stockAdd', currentEventVersion, stock);

                    // save the journal entry
                    JournalKeeper.compose(entry);

                };

                /**
                 * 
                 * <pre>
                 * @spec StockKeeper.remove#1
                 * Given a valid productId
                 * and a positive quantity
                 * when and add is triggered
                 * then a journal entry must be created
                 * an the entry must be registered
                 * 
                 * @spec StockKeeper.remove#2
                 * Given a negative quantity
                 * when and add is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Register a removal of products from stock
                 * 
                 * @param productId - The id for the product we are fiddling with
                 * @param quantity - the number of units we are pulling out
                 */
                this.remove = function(productId, quantity) {
                    var event = new Stock(productId, quantity, null);

                    var stamp = (new Date()).getTime() / 1000;
                    // create a new journal entry
                    var entry = new JournalEntry(null, stamp, 'stockRemove', currentEventVersion, event);

                    // save the journal entry
                    JournalKeeper.compose(entry);
                };
            });

    angular.module('tnt.catalog.stock', [
        'tnt.catalog.stock.entity', 'tnt.catalog.stock.keeper'
    ]);

}(angular));