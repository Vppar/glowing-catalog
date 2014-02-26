(function(angular) {
    'use strict';

    angular.module('tnt.vpsa.appointments.events.entity', []).factory('Event', function Event() {

        var service = function svc(uuid, title,description, date, startTime, endTime, address, contacts, type,status) {

            var validProperties = [
                'uuid', 'title', 'description', 'date', 'startTime', 'endTime', 'address', 'contacts', 'type','status','created'
            ];

            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];

                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw 'Unexpected property ' + ix;
                        }
                    }
                }
            });

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Entity must be initialized with id, title, description, date, starTime, endTime, address, contacts,  type, status';
                }
            } else {
                this.uuid = uuid;
                this.title = title;
                this.description = description;
                this.date = date;
                this.startTime = startTime;
                this.endTime = endTime;
                this.address = address;
                this.contacts = contacts;
                this.type = type;
                this.status = status;
                
            }
            ObjectUtils.ro(this, 'uuid', this.uuid);
        };

        return service;
    });

    /**
     * The keeper for the current entity
     */
    angular.module(
            'tnt.vpsa.appointments.events.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.vpsa.appointments.events.entity',
                'tnt.catalog.journal.keeper', 'tnt.identity'
            ]).config(function($provide) {
                $provide.decorator('$q', function($delegate) {
                    $delegate.reject = function(reason){
                        var deferred = $delegate.defer();
                        deferred.reject(reason);
                        return deferred.promise;
                    };
                    return $delegate;
                });
        }).service('EventKeeper', function EventKeeper($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, Event, IdentityService) {

    	var type = 'ff';
        var currentEventVersion = 1;
        var currentCounter = 0;
        var events = [];
        this.handlers = {};
        
        function getNextId(){
          return ++currentCounter;
        }


        // Nuke event for clearing the event list
        ObjectUtils.ro(this.handlers, 'nukeEvent', function() {
        	events.length = 0;
            return true;
        });
        
        
        ObjectUtils.ro(this.handlers, 'eventCreateV1', function(event) {
          
            var eventData = IdentityService.getUUIDData(event.uuid);
          
            if(eventData.deviceId === IdentityService.getDeviceId()){
                currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
            }
            
            event = new Event(event);
            events.push(event);
            
            return event.uuid;
        });
        
        

        ObjectUtils.ro(this.handlers, 'eventUpdateV1', function(event) {
            var entry = ArrayUtils.find(events, 'uuid', event.uuid);

            if (entry !== null) {
              
                event = angular.copy(event);
                delete event.uuid;
                angular.extend(entry, event);
                
            } else {
                throw 'Event not found.';
            }
            
            return entry.uuid;
        });
        
        /**
         * Registering the handlers with the Replayer
         */
        Replayer.registerHandlers(this.handlers);

        /**
         * create (Event)
         */
        this.create = function(entity) {
            
            if (!(entity instanceof Event)) {
                return $q.reject('Wrong instance to EventKeeper');
            }
            
            var entityObj = angular.copy(entity);

            entityObj.created = (new Date()).getTime();
            entityObj.uuid = IdentityService.getUUID(type, getNextId());
            
            var event = new Event(entityObj);

            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'eventCreate', currentEventVersion, event);

            // save the journal entry
            return JournalKeeper.compose(entry);
        };                

        /**
         * update (Event)
         */
        this.update = function(event) {

            if (!(event instanceof Event)) {
                return $q.reject('Wrong instance to EventKeeper');
            }
            
            var stamp = (new Date()).getTime() / 1000;

            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'eventUpdate', currentEventVersion, event);

            // save the journal entry
            return JournalKeeper.compose(entry);
        };
        
        /**
         * read (Event)
         */
        this.read = function(uuid) {
            return ArrayUtils.find(this.list(), 'uuid', uuid);
        };
        
        /**
         * list(type)
         */
        this.list = function() {
            return angular.copy(events);
        };
        
    });

    angular.module('tnt.vpsa.appointments.entity', [
        'tnt.vpsa.appointments.events.entity', 'tnt.vpsa.appointments.events.keeper'
    ]).run(function(EventKeeper) {
        // Warming up EventKeeper
    });

}(angular));
