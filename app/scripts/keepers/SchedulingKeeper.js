(function (angular) {
    'use strict';

    angular.module('tnt.catalog.scheduling.entity', []).factory('Schedule', function Schedule () {

        var service = function svc (uuid, created, documentUUID, date, status, items) {

            var validProperties = [
                'uuid', 'created', 'documentUUID', 'date', 'status', 'items', 'updated'
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
                    throw 'Schedule must be initialized with uuid, documentUUID, date, items';
                }
            } else {
                this.uuid = uuid;
                this.date = date;
                this.items = items;
                this.created = created;
                this.documentUUID = documentUUID;
                this.status = status;
            }
            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'created', this.created);
            ObjectUtils.ro(this, 'documentUUID', this.documentUUID);
        };

        return service;
    });

    angular.module(
        'tnt.catalog.scheduling.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.scheduling.entity',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.journal.keeper',
            'tnt.identity'
        ]).service(
        'SchedulingKeeper',
        [
            '$q',
            'ArrayUtils',
            'JournalKeeper',
            'JournalEntry',
            'Replayer',
            'IdentityService',
            'Schedule',
            '$filter',
            function SchedulingKeeper ($q, ArrayUtils, JournalKeeper, JournalEntry, Replayer,
                IdentityService, Schedule, $filter) {

                var type = 12;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var schedulings = [];
                this.handlers = {};

                function getNextId () {
                    return ++currentCounter;
                }

                /**
                 * Registering handlers
                 */
                ObjectUtils.ro(this.handlers, 'schedulingCreateV1', function (event) {
                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter =
                            currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new Schedule(event);
                    schedulings.push(event);

                    return event.uuid;
                });

                ObjectUtils.ro(this.handlers, 'schedulingUpdateV1', function (event) {
                    var scheduleEntry = ArrayUtils.find(schedulings, 'uuid', event.uuid);

                    var finalItems = scheduleEntry.items;

                    for ( var ix in event.items) {
                        var item = event.items[ix];
                        var scheduled = ArrayUtils.find(finalItems, 'id', item.id);

                        if (scheduled) {
                            scheduled.dQty += item.dQty;
                            scheduled.sQty = item.sQty;
                            
                            if(!item.deliveredDate){
                                item.deliveredDate = scheduled.deliveredDate;
                            }
                            
                            scheduled.deliveredDate = item.deliveredDate;
                        } else {
                            finalItems.push(item);
                        }
                        
                    }
                    
                    if (scheduleEntry) {
                        scheduleEntry.updated = event.updated;
                        scheduleEntry.date = event.date;
                        scheduleEntry.items = finalItems;
                        scheduleEntry.status = event.status;
                    } else {
                        throw 'Unable to find an scheduling with uuid=\'' + event.uuid + '\'';
                    }
                });

                ObjectUtils.ro(this.handlers, 'schedulingRemoveV1', function (event) {
                    var scheduleEntry = ArrayUtils.find(schedulings, 'uuid', event.uuid);
                    if (scheduleEntry) {
                        scheduleEntry.updated = event.updated;
                        scheduleEntry.date = event.date;
                        scheduleEntry.items = event.items;
                    } else {
                        throw 'Unable to find an scheduling with uuid=\'' + event.uuid + '\'';
                    }
                });

                // Nuke event for clearing the orders list
                ObjectUtils.ro(this.handlers, 'nukeSchedulingV1', function () {
                    schedulings.length = 0;
                    return true;
                });

                /**
                 * Registering the handlers with the Replayer
                 */
                Replayer.registerHandlers(this.handlers);

                /**
                 * Adds an order
                 */

                var create =
                    function create (schedule) {
                        if (!(schedule instanceof Schedule)) {
                            return $q.reject('Wrong instance to SchedulingKeeper');
                        }
                        var scheduleObj = angular.copy(schedule);

                        scheduleObj.uuid = IdentityService.getUUID(type, getNextId());

                        var event = new Schedule(scheduleObj);

                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                event.created,
                                'schedulingCreate',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                /**
                 * List all Scheduling
                 */
                var list = function list () {
                    return angular.copy(schedulings);
                };

                /**
                 * List Active Scheduling
                 */
                var listActive = function list () {
                    return angular.copy(ArrayUtils.list(schedulings, 'status', true));
                };

                /**
                 * Read an Scheduling
                 */
                var readByDocument = function readByDocument (uuid) {
                    return angular.copy(ArrayUtils.find(schedulings, 'documentUUID', uuid));
                };

                var readActiveByDocument = function readByDocument (uuid) {
                    var active = ArrayUtils.list(schedulings, 'status', true);
                    return angular.copy(ArrayUtils.find(active, 'documentUUID', uuid));
                };

                var readDeliveredByDocument = function readDeliveredByDocument (uuid) {
                    var delivered = ArrayUtils.list(schedulings, 'status', false);
                    return angular.copy(ArrayUtils.find(delivered, 'documentUUID', uuid));
                };

                /**
                 * Read an Scheduling
                 */
                var read = function read (uuid) {
                    return angular.copy(ArrayUtils.find(schedulings, 'uuid', uuid));
                };

                /**
                 * Update an Scheduling
                 */
                var update =
                    function update (uuid, date, items, status) {
                        var schedule = ArrayUtils.find(schedulings, 'uuid', uuid);
                        if (!schedule) {
                            throw 'Unable to find an schedule with uuid=\'' + uuid + '\'';
                        }
                        var updateEv = {
                            uuid : uuid,
                            date : date,
                            updated : new Date().getTime(),
                            items : items,
                            status : status
                        };
                        // create a new journal entry
                        var entry =
                            new JournalEntry(
                                null,
                                updateEv.updated,
                                'schedulingUpdate',
                                currentEventVersion,
                                updateEv);
                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                this.create = create;
                this.list = list;
                this.listActive = listActive;
                this.read = read;
                this.readDeliveredByDocument = readDeliveredByDocument;
                this.readActiveByDocument = readActiveByDocument;
                this.readByDocument = readByDocument;
                this.update = update;

            }
        ]);
    angular.module('tnt.catalog.scheduling', [
        'tnt.catalog.scheduling.entity', 'tnt.catalog.scheduling.keeper'
    ]).run([
        'SchedulingKeeper', function (SchedulingKeeper) {
            // Warming up SchedulingKeeper
        }
    ]);

}(angular));
