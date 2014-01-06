(function(angular) {
    'use strict';

    /**
     * The inventory entity
     */
    angular.module('tnt.catalog.inventory.entity', []).factory('Inventory', function Inventory() {

        var service = function svc(productId, quantity, cost) {

            if (arguments.length != svc.length) {
                throw 'Inventory must be initialized with productId, quantity and cost';
            }

            this.productId = productId;
            this.quantity = quantity;
            this.cost = cost;
        };

        return service;
    });

    /**
     * The keeper for the current inventory position
     */
    angular.module('tnt.catalog.inventory.keeper', []).service(
            'Inventorykeeper', function Inventorykeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Inventory) {

                var currentEventVersion = 1;
                var inventory = [];
                this.handlers = {};

                /**
                 * <pre>
                 * @spec Inventorykeeper.handlers.inventoryAddV1#1
                 * Given a valid event
                 * and an existing productId
                 * when an add is triggered
                 * then the position must be updated
                 * and the quantity must be the sum
                 * and the price must be the average
                 * 
                 * @spec Inventorykeeper.handlers.inventoryAddV1#2
                 * Given a valid event 
                 * and a non existent productId
                 * when an add is triggered
                 * the a new entry must be added
                 * and it must be an instance of Inventory
                 * 
                 * @spec Inventorykeeper.handlers.inventoryAddV1#3
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
                 * @param event - something that resembles, but not necessarily is, an instance of Inventory
                 */
                ObjectUstils.ro(handlers, 'inventoryAddV1', function(event) {
                    var entry = ArrayUtils.find(inventory, 'productId', event.productId);

                    if (entry === null) {
                        event = new Inventory(event.productId, event.quantity, event.price);
                        inventory.push(event);
                    } else {
                        var updatedInv = entry.quantity + event.quantity;
                        var average = (entry.quantity * entry.price) + (event.quantity * event.price) / updatedInv;
                        entry.price = average;
                        entry.quantity = updatedInv;
                    }
                });

                /**
                 * <pre>
                 * @spec Inventorykeeper.handlers.inventoryRemoveV1#1
                 * Given a valid event
                 * and an existing productId
                 * when a remove is triggered
                 * then the entry quantity must be subtracted by the given amount
                 * 
                 * @spec Inventorykeeper.handlers.inventoryRemoveV1#2
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
                 * @param event - something that resembles, but not necessarily is, an instance of Inventory
                 */
                ObjectUstils.ro(handlers, 'inventoryRemoveV1', function(event) {
                    
                    var entry = ArrayUtils.find(inventory, 'productId', event.productId);

                    if (entry === null) {
                        throw 'Entity not found, cosistency must be broken! Replay?';
                    }
                    
                    entry -= event.quantity;
                });

                // Registering the handlers with the Replayer
                Replayer.registerHandlers(handlers);

                /**
                 * <pre>
                 * @spec Inventorykeeper.add#1
                 * Given a valid productId
                 * and a positive quantity
                 * and a valid cost
                 * when and add is triggered
                 * then a journal entry must be created
                 * an the entry must be registered
                 * 
                 * @spec Inventorykeeper.add#2
                 * Given a negative quantity
                 * when and add is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Register an addition of products to the inventory
                 * 
                 * @param productId - The id for the product we are fiddling with
                 * @param quantity - the number of units we are pulling in
                 * @param cost - unary cost for the product we are pulling in 
                 */
                this.add = function(productId, quantity, cost) {
                    if (quantity > 0) {

                        var event = new Inventory(productId, quantity, cost);

                        var stamp = (new Date()).getTime() / 1000;
                        // create a new journal entry
                        var entry = new JournalEntry(null, stamp, 'inventoryAdd', currentEventVersion, event);

                        // save the journal entry
                        JournalKeeper.compose(entry);
                    } else {
                        throw 'error';
                    }

                };

                /**
                 * 
                 * <pre>
                 * @spec Inventorykeeper.remove#1
                 * Given a valid productId
                 * and a positive quantity
                 * when and add is triggered
                 * then a journal entry must be created
                 * an the entry must be registered
                 * 
                 * @spec Inventorykeeper.remove#2
                 * Given a negative quantity
                 * when and add is triggered
                 * then an error must be raised
                 * 
                 * </pre>
                 * 
                 * Register a removal of products from inventory
                 * 
                 * @param productId - The id for the product we are fiddling with
                 * @param quantity - the number of units we are pulling out
                 */
                this.remove = function(productId, quantity) {
                    if (quantity > 0) {

                        var event = new Inventory(productId, quantity, null);

                        var stamp = (new Date()).getTime() / 1000;
                        // create a new journal entry
                        var entry = new JournalEntry(null, stamp, 'inventoryRemove', currentEventVersion, event);

                        // save the journal entry
                        JournalKeeper.compose(entry);
                    } else {
                        throw 'error';
                    }
                };
            });

    angular.module('tnt.catalog.inventory', [
        'tnt.catalog.inventory.entity', 'tnt.catalog.inventory.keeper'
    ]);

}(angular));