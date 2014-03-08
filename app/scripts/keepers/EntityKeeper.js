(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.entity.entity', [])
        .factory(
            'Entity',
            function Entity () {

                var service =
                    function svc (uuid, name, emails, birthDate, phones, cep, document, addresses,
                        remarks) {

                        var validProperties =
                            [
                                'uuid',
                                'name',
                                'emails',
                                'birthDate',
                                'phones',
                                'cep',
                                'document',
                                'addresses',
                                'remarks',
                                'created'
                            ];

                        ObjectUtils.method(svc, 'isValid', function () {
                            for ( var ix in this) {
                                var prop = this[ix];

                                if (!angular.isFunction(prop)) {
                                    if (validProperties.indexOf(ix) === -1) {
                                        throw 'Unexpected property ' + ix;
                                    }
                                }
                            }
                        });

                        if (arguments.length !== svc.length) {
                            if (arguments.length === 1 && angular.isObject(arguments[0])) {
                                svc.prototype.isValid.apply(arguments[0]);
                                ObjectUtils.dataCopy(this, arguments[0]);
                            } else {
                                throw 'Entity must be initialized with id, name, emails, birthDate, phones, cep, document, addresses,  remarks';
                            }
                        } else {
                            this.uuid = uuid;
                            this.name = name;
                            this.emails = emails;
                            this.birthDate = birthDate;
                            this.phones = phones;
                            this.cep = cep;
                            this.document = document;
                            this.addresses = addresses;
                            this.remarks = remarks;

                        }
                        ObjectUtils.ro(this, 'uuid', this.uuid);
                    };

                return service;
            });

    /**
     * The keeper for the current entity
     */
    angular.module(
        'tnt.catalog.entity.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.entity.entity',
            'tnt.catalog.journal.keeper',
            'tnt.identity'
        ]).service(
        'EntityKeeper',
        [
            '$q',
            'Replayer',
            'JournalEntry',
            'JournalKeeper',
            'ArrayUtils',
            'Entity',
            'IdentityService',
            function EntityKeeper ($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, Entity,
                IdentityService) {

                var type = 3;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var entities = [];
                this.handlers = {};

                function getNextId () {
                    return ++currentCounter;
                }

                // Nuke event for clearing the entities list
                ObjectUtils.ro(this.handlers, 'nukeEntitiesV1', function () {
                    entities.length = 0;
                    return true;
                });

                ObjectUtils.ro(this.handlers, 'entityCreateV1', function (event) {

                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter =
                            currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new Entity(event);
                    entities.push(event);

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'entityUpdateV1', function (event) {
                    var entry = ArrayUtils.find(entities, 'uuid', event.uuid);

                    if (entry !== null) {

                        event = angular.copy(event);
                        delete event.uuid;
                        angular.extend(entry, event);

                    } else {
                        throw 'User not found.';
                    }

                    return entry.uuid;
                });

                /**
                 * Registering the handlers with the Replayer
                 */
                Replayer.registerHandlers(this.handlers);

                /**
                 * create (Entity)
                 */
                this.create =
                    function (entity) {

                        if (!(entity instanceof Entity)) {
                            return $q.reject('Wrong instance to EntityKeeper');
                        }

                        var entityObj = angular.copy(entity);

                        entityObj.created = (new Date()).getTime();
                        entityObj.uuid = IdentityService.getUUID(type, getNextId());

                        var event = new Entity(entityObj);

                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                event.created,
                                'entityCreate',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                /**
                 * update (Entity)
                 */
                this.update =
                    function (entity) {

                        if (!(entity instanceof Entity)) {
                            return $q.reject('Wrong instance to EntityKeeper');
                        }

                        var event = entity;
                        var stamp = (new Date()).getTime() / 1000;

                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                stamp,
                                'entityUpdate',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                /**
                 * read (Entity)
                 */
                this.read = function (uuid) {
                    return ArrayUtils.find(this.list(), 'uuid', uuid);
                };

                /**
                 * list(type)
                 */
                this.list = function () {
                    return angular.copy(entities);
                };

            }
        ]);

    angular.module('tnt.catalog.entity', [
        'tnt.catalog.entity.entity', 'tnt.catalog.entity.keeper'
    ]).run([
        'EntityKeeper', function (EntityKeeper) {
            // Warming up EntityKeeper
        }
    ]);

}(angular));
