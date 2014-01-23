(function(angular) {
    'use strict';

    angular.module('tnt.catalog.entity.entity', []).factory('Entity', function Entity() {

        var service = function svc(id, name, emails, birthDate, phones, cep, document, addresses,  remarks) {

            var validProperties = [
                'id', 'name', 'emails', 'birthDate', 'phones', 'cep', 'document', 'addresses', 'remarks','created'
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
                    throw 'Entity must be initialized with id, name, emails, birthDate, phones, cep, document, addresses,  remarks';
                }
            } else {
                this.name = name;
                this.emails = emails;
                this.birthDate = birthDate;
                this.phones = phones;
                this.cep = cep;
                this.document = document;
                this.addresses = addresses;
                this.remarks = remarks;
                
            }
        };

        return service;
    });

    /**
     * The keeper for the current entity
     */
    angular.module(
            'tnt.catalog.entity.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.entity.entity',
                'tnt.catalog.journal.keeper'
            ]).service('EntityKeeper', function EntityKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Entity) {

        var currentEventVersion = 1;
        var entity = [];
        this.handlers = {};

        ObjectUtils.ro(this.handlers, 'entityCreateV1', function(event) {
            var entry = ArrayUtils.find(entity, 'document', event.document);

            if (entry === null) {
                event = new Entity(event);
                entity.push(event);
            } else {
                entry.id = event.id;
                entry.name = event.name;
                entry.emails = event.emails;
                entry.birthDate = event.birthDate;
                entry.phones = event.phones;
                entry.cep = event.cep;
                entry.document = event.document;
                entry.addresses = event.addresses;
                entry.remarks = event.remarks;
            }
        });
        
        

        ObjectUtils.ro(this.handlers, 'entityUpdateV1', function(event) {
            var entry = ArrayUtils.find(entity, 'document', event.document);

            if (entry !== null) {
                entry.name = event.name;
                entry.emails = event.emails;
                entry.birthDate = event.birthDate;
                entry.phones = event.phones;
                entry.cep = event.cep;
                entry.document = event.document;
                entry.addresses = event.addresses;
                entry.remarks = event.remarks;
            } else {
                throw "User not found.";
            }
        });
        
        /**
         * Registering the handlers with the Replayer
         */
        Replayer.registerHandlers(this.handlers);

        /**
         * create (Entity)
         * 
         */
        this.create = function(entityObject) {
            
            if (!entityObject instanceof Entity) {
                throw "Wrong instance.";
            }

            var event = entityObject;
            var stamp = (new Date()).getTime() / 1000;

            event.created = stamp;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'entityCreate', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * update (Entity)
         */
        this.update = function(entityObject) {

            if (entityObject instanceof Entity) {
                entityObject.isValid();
            } else {
                throw "Wrong instance.";
            }

            var event = entityObject;
            var stamp = (new Date()).getTime() / 1000;

            event.created = stamp;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'entityUpdate', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * list(type)
         */
        this.list = function() {
            return angular.copy(entity);
        };

    });

    angular.module('tnt.catalog.entity', [
        'tnt.catalog.entity.entity', 'tnt.catalog.entity.keeper'
    ]);

}(angular));
