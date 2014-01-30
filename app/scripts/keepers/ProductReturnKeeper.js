(function(angular) {
    'use strict';
    /**
     * The ReturnedProduct with link between devolution, client and products
     * 
     * <pre>
     * @test ReturnProduct.constructor#1
     * Validate the data on the returned object
     * 
     * @test ReturnProduct.constructor#2
     * Validate the read only fields
     * 
     * </pre>
     */
    angular.module('tnt.catalog.productReturn.entity', [
        'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper'
    ]).factory('ProductReturn', function ProductReturn() {

        var service = function svc(id, productId, quantity, cost) {

            var validProperties = [
                'id', 'productId', 'quantity', 'cost', 'created'
            ];
            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw "Unexpected property " + ix;
                        }
                    }
                }
            });
            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'ProductReturn must be initialized with id, productId, quantity and cost';
                }
            } else {
                this.id = id;
                this.productId = productId;
                this.quantity = quantity;
                this.cost = cost;
            }
            ObjectUtils.ro(this, 'id', this.id);

        };

        return service;
    });

    /**
     * The keeper for the returned product
     */
    angular.module('tnt.catalog.productReturn.keeper', [
        'tnt.utils.array'
    ]).service('ProductReturnKeeper', function ProductReturnKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, ProductReturn) {

        var currentEventVersion = 1;
        var productsReturned = [];
        this.handlers = {};

        /**
         * <pre>
         * @spec ProductReturnKeeper.handlers.productReturnAddV1#1
         * Given a valid event
         * and an existing devoltutionId
         * when an add is triggered
         * then the position must be updated
         * 
         * @spec ProductReturnKeeper.handlers.productReturnAddV1#2
         * Given a valid event 
         * and a non existent productId
         * when an add is triggered
         * the a new entry must be added
         * and it must be an instance of ReturnProduct
         * 
         * @spec ProductReturnKeeper.handlers.productReturnAddV1#3
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
         * @param event - ProductReturn
         */
        ObjectUtils.ro(this.handlers, 'productReturnAddV1', function(event) {
            var productEntry = new ProductReturn(event);
            productsReturned.push(productEntry);
        });

        // Registering the handlers with the Replayer
        Replayer.registerHandlers(this.handlers);

        /**
         * <pre>
         * @spec ProductReturnKeeper.add#1
         * Given a valid devolutionId
         * and a positive quantity
         * and a valid cost
         * when and add is triggered
         * then a journal entry must be created
         * an the entry must be registered
         * 
         * @spec ProductReturnKeeper.add#2
         * Given a negative quantity
         * when and add is triggered
         * then an error must be raised
         * 
         * </pre>
         * 
         * Register an product devolution on the returnedProducts
         *
         * @param devoltuionId - The id for the devolution we are fiddling with 
         * @param productId - The id for the product returned
         * @param quantity - The number of units returned
         * @param cost - Cost for the product returned 
         */
        this.add = function(productReturn) {
            if (!(productReturn instanceof ProductReturn)) {
                throw "Wrong instance of ProductReturn.";
            }

            var event = angular.copy(productReturn);
            event.created = (new Date()).getTime();

            event = new ProductReturn(event);

            var entry = new JournalEntry(null, event.created, 'productReturnAdd', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        this.list = function() {
            return angular.copy(productsReturned);
        };

    });

    angular.module('tnt.catalog.productReturn', [
        'tnt.catalog.productReturn.entity', 'tnt.catalog.productReturn.keeper'
    ]);

}(angular));