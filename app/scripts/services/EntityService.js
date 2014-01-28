(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Entitys.
     * 
     * @author Cassiano R. Tesseroli
     */

    angular.module('tnt.catalog.entity.service', [
        'tnt.catalog.entity.entity', 'tnt.catalog.entity.keeper'
    ]).service('EntityService', function EntityService($log, EntityKeeper) {

      this.isValid = function(entity) {
            var invalidProperty = {};

            invalidProperty.id = angular.isNumber(entity.id);
            invalidProperty.name = angular.isDefined(entity.name);
            invalidProperty.emails = angular.isDefined(entity.emails);
            invalidProperty.phones = angular.isDefined(entity.phones);
            invalidProperty.cep = angular.isDefined(entity.cep);
            invalidProperty.document = angular.isDefined(entity.document);
            invalidProperty.addresses = angular.isDefined(entity.addresses);
            invalidProperty.remarks = angular.isDefined(entity.remarks);

            var result = [];

            for ( var ix in invalidProperty) {
                if (!invalidProperty[ix]) {
                    // Create a new empty object, set a property
                    // with the name of the invalid property,
                    // fill it with the invalid value and add to
                    // the result
                    result.push({}[ix] = entity[ix]);
                }
            }

            return result;
        };

        /**
         * Returns the full entity list.
         * 
         * @return Array - entity list.
         */
        this.list = function() {
            var result = null;
            try {
                result = EntityKeeper.list();
            } catch (err) {
                $log.debug('EntityService.list: Unable to recover the list of entity. Err=' + err);
            }
            return result;
        };

        /**
         * Returns a single entity by its id.
         * 
         * @param id - Entity id.
         * @return Entity - The desired entity.
         */
        this.read = function(id) {
            var result = null;
            try {
                result = EntityKeeper.read(id);
            } catch (err) {
                $log.debug('EntityService.read: Unable to find a entity with id=\'' + id + '. Err=' + err);
            }
            return result;
        };

        /**
         * Create a entity in the datastore.
         * 
         * @param entity - Entity object to be registered.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.create = function(entity) {
            var result = this.isValid(entity);
            if (result.length === 0) {
                try {
                    EntityKeeper.create(entity);
                } catch (err) {
                    throw 'EntityService.create: Unable to create a entity =' + JSON.stringify(entity) + '. Err=' + err;
                }
            }
        };

        /**
         * 
         * Update values from entity
         * 
         * @param Entity - Entity to be update.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.update = function(entity) {
            var result = this.isValid(entity);
            if (result.length === 0) {
                try {
                    EntityKeeper.update(entity);
                } catch (err) {
                    throw 'EntityService.update: Unable to update a entity=' + JSON.stringify(receivable) + '. Err=' + err;
                }
            }
            return result;
        };
        this.find = function(id) {};
    });

})(angular);
