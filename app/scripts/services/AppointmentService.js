(function(angular) {
    'use strict';

    /**
     * Service to manage operations over Events (Appointments).
     * 
     * @author Iago Quirino
     */

    angular.module('tnt.vpsa.appointments.events.service', [
        'tnt.vpsa.appointments.events.entity', 'tnt.vpsa.appointments.events.keeper'
    ]).service('EventService', function EventService($log, $q, EventKeeper, Event) {

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
                result = EventKeeper.list();
            } catch (err) {
                $log.debug('EventService.list: Unable to recover the list of events. Err=' + err);
            }
            return result;
        };

        /**
         * Returns a single event by its id.
         * 
         * @param uuid - Event uuid.
         * @return Event - The desired entity.
         */
        this.read = function(uuid) {
            var result = null;
            try {
                result = EventKeeper.read(uuid);
            } catch (err) {
                $log.debug('EventService.read: Unable to find an event with id=\'' + uuid + '. Err=' + err);
            }
            return result;
        };

        /**
         * Create a event in the datastore.
         * 
         * @param event - Event object to be registered.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.create = function(event) {
            var result = null;
            event = new Event(event);
            var hasErrors = this.isValid(event);
            if (hasErrors.length === 0) {
                result = EventKeeper.create(event);
            } else {
                result = $q.reject(hasErrors);
            }
            return result;
        };

        /**
         * 
         * Update values from event
         * 
         * @param eventObj - Event to be update.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.update = function(event) {
            var result = this.isValid(event);
            if (result.length === 0) {
                try {
                    EventKeeper.update(event);
                } catch (err) {
                    throw 'EventService.update: Unable to update an event=' + JSON.stringify(receivable) + '. Err=' + err;
                }
            }
            return result;
        };
        
        /**
         * 
         * Set event to Done
         * 
         * @param id - id of Event to be update.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.done = function(id) {
        	var result = "";
        	try {
        		var event = this.read(id);
        		event.status = "DONE";
        		result = this.update(event);
            } catch (err) {
                throw 'EventService.done: Unable to done an event=' + JSON.stringify(receivable) + '. Err=' + err;
            }
            return result;
        };
        
        /**
         * 
         * Set event to Cancel
         * 
         * @param id - id of Event to be update.
         * @throws Exception in case of a fatal error comming from the keeper.
         */
        this.cancel = function(id) {
        	var result = "";
        	try {
        		var event = this.read(id);
            	event.status = "CANCELLED";
            	result = this.update(event);	
            } catch (err) {
                throw 'EventService.cancel: Unable to cancel an event=' + JSON.stringify(receivable) + '. Err=' + err;
            }
            return result;
        };
        
        this.listByPeriod = function(since,upon)
        {
        	return this.list();
        };
        
    });

})(angular);