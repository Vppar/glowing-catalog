(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Entitys.
     * 
     * @author Cassiano R. Tesseroli
     */

    angular.module('tnt.catalog.entity.service', [
        'tnt.catalog.entity.entity', 'tnt.catalog.entity.keeper'
    ]).service('EntityService', ['$log', '$q', 'EntityKeeper', 'Entity', function EntityService($log, $q, EntityKeeper, Entity) {

      this.isValid = function(entity) {
            var invalidProperty = {};

            //just name and phone are mandatory
            invalidProperty.name = angular.isDefined(entity.name);
            invalidProperty.phones = angular.isDefined(entity.phones);

            var result = [];

            for ( var ix in invalidProperty) {
                if (!invalidProperty[ix]) {
                    // Create a new empty object, set a property
                    // with the name of the invalid property,
                    // fill it with the invalid value and add to
                    // the result
                    var error = {};
                    error[ix] = entity[ix];
                    result.push(error);
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
         * @param uuid - Entity uuid.
         * @return Entity - The desired entity.
         */
        this.read = function(uuid) {
            var result = null;
            try {
                result = EntityKeeper.read(uuid);
            } catch (err) {
                $log.debug('EntityService.read: Unable to find a entity with id=\'' + uuid + '. Err=' + err);
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
            var result = null;
            entity = new Entity(entity);
            var hasErrors = this.isValid(entity);
            if (hasErrors.length === 0) {
                result = EntityKeeper.create(entity);
            } else {
                result = $q.reject(hasErrors);
            }
            return result;
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
    }]);

})(angular);
