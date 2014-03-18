(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Consultants.
     */

    angular.module('tnt.catalog.consultant.service', [
        'tnt.catalog.consultant.entity', 'tnt.catalog.consultant.keeper', 'tnt.util.log'
    ]).service('ConsultantService', [
        'logger', '$q', 'ConsultantKeeper', 'Consultant', function ConsultantService(logger, $q, ConsultantKeeper, Consultant) {

            var log = logger.getLogger('tnt.catalog.consultant.service.ConsultantService');

            this.isValid = function(consultant) {
                var invalidProperty = {};

                // FIXME - update to the current mandatory parameters
                // just name and phone are mandatory
                invalidProperty.name = angular.isDefined(consultant.name);

                var result = [];

                for ( var ix in invalidProperty) {
                    if (!invalidProperty[ix]) {
                        // Create a new empty object, set a property
                        // with the name of the invalid property,
                        // fill it with the invalid value and add to
                        // the result
                        var error = {};
                        error[ix] = consultant[ix];
                        result.push(error);
                    }
                }

                return result;
            };

            /**
             * Returns the full consultant list.
             * 
             * @return Array - consultant list.
             */
            this.list = function() {
                var result = null;
                try {
                    result = ConsultantKeeper.list();
                } catch (err) {
                    log.debug('ConsultantService.list: Unable to recover the list of Consultant. Err=' + err);
                }
                return result;
            };

            /**
             * Returns a single consultant by its id.
             * 
             * @param uuid - Consultant uuid.
             * @return Consultant - The desired consultant.
             */
            this.read = function(uuid) {
                var result = null;
                try {
                    result = ConsultantKeeper.read(uuid);
                } catch (err) {
                    log.debug('ConsultantService.read: Unable to find a consultant with id=\'' + uuid + '. Err=' + err);
                }
                return result;
            };

            /**
             * Create a consultant in the datastore.
             * 
             * @param consultant - Consultant object to be registered.
             * @return {Promise} - Promise containing the result or failure
             */
            this.create = function(consultant) {
                var result = null;
                consultant = new Consultant(consultant);
                var hasErrors = this.isValid(consultant);
                if (hasErrors.length === 0) {
                    result = ConsultantKeeper.create(consultant);
                } else {
                    result = $q.reject(hasErrors);
                }
                return result;
            };

            /**
             * 
             * Update values from consultant
             * 
             * @param Consultant - Consultant to be update.
             * @return Array - Array of objects containing the invalid
             *         properties.
             * @throws Exception in case of a fatal error comming from the
             *             keeper.
             */
            this.update = function(consultant) {
                var result = this.isValid(consultant);
                if (result.length === 0) {
                    consultant = new Consultant(consultant);
                    var promise = ConsultantKeeper.update(consultant);

                    return promise.then(function(resp) {
                        return resp;
                    }, function(error) {
                        return $q.reject(log.error('ConsultantService.update: Unable to update a consultant=' + +'. Err=' + error));
                    });
                } else {
                    return $q.reject(result);
                }
            };
            
            /**
             * Get method to return always the same consultant.
             */
            this.get = function() {
                return ConsultantKeeper.get();
            };
            
            /**
             * Nuke the data
             */
            this.nuke = function(){
                return ConsultantKeeper.nuke();
            };
        }
        
    ]);

})(angular);
