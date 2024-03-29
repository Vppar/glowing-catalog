(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.appointments.entity', [])
        .factory(
            'Appointment',
            function Appointment () {

                var service =
                    function svc (uuid, title, description, startDate, endDate, address, contacts,
                        allDay, color, type, status) {
                        var validProperties =
                            [
                                'uuid',
                                'title',
                                'description',
                                'startDate',
                                'endDate',
                                'address',
                                'contacts',
                                'type',
                                'status',
                                'allDay',
                                'color',
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
                                throw 'Entity must be initialized with id, title, description, startDate, endDate, address, contacts,  type, status';
                            }
                        } else {
                            this.uuid = uuid;
                            this.title = title;
                            this.description = description;
                            this.startDate = startDate;
                            this.endDate = endDate;
                            this.address = address;
                            this.contacts = contacts;
                            this.type = type;
                            this.color = color;
                            this.allDay = allDay;
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
        'tnt.catalog.appointments.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.appointments.entity',
            'tnt.catalog.journal.keeper',
            'tnt.identity'
        ]).service(
        'AppointmentKeeper',
        [
            '$q',
            'Replayer',
            'JournalEntry',
            'JournalKeeper',
            'ArrayUtils',
            'Appointment',
            'IdentityService',
            function AppointmentKeeper ($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils,
                Appointment, IdentityService) {

                var type = 99;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var appointments = [];
                this.handlers = {};

                function getNextId () {
                    return ++currentCounter;
                }

                ObjectUtils.ro(this.handlers, 'nukeAppointmentV1', function () {
                    appointments.length = 0;
                    return true;
                });

                ObjectUtils.ro(this.handlers, 'appointmentCreateV1', function (appointment) {

                    var appointmentData = IdentityService.getUUIDData(appointment.uuid);

                    if (appointmentData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter =
                            currentCounter >= appointmentData.id ? currentCounter
                                : appointmentData.id;
                    }
                    appointment = new Appointment(appointment);
                    appointments.push(appointment);
                    return appointment.uuid;
                });

                ObjectUtils.ro(this.handlers, 'appointmentUpdateV1', function (appointment) {
                    var entry = ArrayUtils.find(appointments, 'uuid', appointment.uuid);

                    if (entry !== null) {
                        appointment = angular.copy(appointment);
                        delete appointment.uuid;
                        angular.extend(entry, appointment);
                    } else {
                        throw 'Appointment not found.';
                    }
                    return entry.uuid;
                });

                Replayer.registerHandlers(this.handlers);

                this.create =
                    function (entity) {

                        if (!(entity instanceof Appointment)) {
                            return $q.reject('Wrong instance to AppointmentKeeper');
                        }

                        var entityObj = angular.copy(entity);

                        entityObj.created = (new Date()).getTime();
                        entityObj.uuid = IdentityService.getUUID(type, getNextId());

                        var appointment = new Appointment(entityObj);

                        var entry =
                            new JournalEntry(
                                null,
                                appointment.created,
                                'appointmentCreate',
                                currentEventVersion,
                                appointment);

                        return JournalKeeper.compose(entry);
                    };

                this.update =
                    function (appointment) {

                        var stamp = (new Date()).getTime() / 1000;

                        var entry =
                            new JournalEntry(
                                null,
                                stamp,
                                'appointmentUpdate',
                                currentEventVersion,
                                appointment);

                        return JournalKeeper.compose(entry);
                    };

                this.read = function (uuid) {
                    return ArrayUtils.find(this.list(), 'uuid', uuid);
                };

                this.list = function () {
                    return angular.copy(appointments);
                };

            }
        ]);

    angular.module('tnt.catalog.appointments', [
        'tnt.catalog.appointments.entity', 'tnt.catalog.appointments.keeper'
    ]).run(function(AppointmentKeeper) {
        // Warming up AppointmentKeeper
    });

}(angular));