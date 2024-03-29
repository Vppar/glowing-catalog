(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.consultant.entity', [])
        .factory(
            'Consultant',
            function Consultant () {

                var service =
                    function svc (uuid, name, mkCode, cep, address, cpf, bank, agency, account,
                        email) {

                        var validProperties =
                            [
                                'uuid',
                                'name',
                                'mkCode',
                                'cep',
                                'address',
                                'cpf',
                                'accountHolder',
                                'holderDocument',
                                'bank',
                                'agency',
                                'account',
                                'accountType',
                                'email',
                                'marital',
                                'gender',
                                'birthDate',
                                'cityOrigin',
                                'countryOrigin',
                                'complement',
                                'emissary',
                                'phone',
                                'cellphone',
                                'emailPrimer',
                                'emailDirector',
                                'primerCode',
                                'unityNumber',
                                'area',
                                'subscriptionExpirationDate'
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
                                throw 'Consultant must be initialized with uuid, name, mkCode, cep, address, cpf, bank, agency, account, email';
                            }
                        } else {
                            this.uuid = uuid;
                            this.name = name;
                            this.mkCode = mkCode;
                            this.cep = cep;
                            this.address = address;
                            this.cpf = cpf;
                            this.bank = bank;
                            this.agency = agency;
                            this.account = account;
                            this.email = email;
                        }
                        ObjectUtils.ro(this, 'uuid', this.uuid);
                    };

                return service;
            });

    /**
     * The keeper for the current Consultant
     */
    angular.module(
        'tnt.catalog.consultant.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.consultant.entity',
            'tnt.catalog.journal.keeper',
            'tnt.identity',
            'tnt.catalog.keeper'
        ]).service(
        'ConsultantKeeper',
        [
            '$q',
            'Replayer',
            'JournalEntry',
            'JournalKeeper',
            'ArrayUtils',
            'Consultant',
            'IdentityService',
            ConsultantKeeper
        ]).run(['MasterKeeper', function (MasterKeeper) {
            ObjectUtils.inherit(ConsultantKeeper, MasterKeeper);
        }]);
    
    function ConsultantKeeper ($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, Consultant,
        IdentityService) {

        var type = 14;
        var currentEventVersion = 1;
        var currentCounter = 0;
        var consultants = [];
        this.handlers = {};
        
        ObjectUtils.superInvoke(this, 'Consultant', Consultant, currentEventVersion);

        function getNextId () {
            return ++currentCounter;
        }

        // Nuke event for clearing the consultants list
        ObjectUtils.ro(this.handlers, 'nukeConsultantsV1', function () {
            consultants.length = 0;
            return true;
        });

        ObjectUtils.ro(this.handlers, 'consultantCreateV1', function (event) {

            var eventData = IdentityService.getUUIDData(event.uuid);

            if (eventData.deviceId === IdentityService.getDeviceId()) {
                currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
            }

            event = new Consultant(event);
            consultants.push(event);

            return event.uuid;
        });

        ObjectUtils.ro(this.handlers, 'consultantUpdateV1', function (event) {
            var entry = ArrayUtils.find(consultants, 'uuid', event.uuid);
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
         * create (Consultant)
         */
        this.create =
            function (consultant) {

                if (!(consultant instanceof Consultant)) {
                    return $q.reject('Wrong instance to ConsultantKeeper');
                }

                var consultantObj = angular.copy(consultant);

                consultantObj.uuid = IdentityService.getUUID(type, getNextId());

                return this.journalize('Create', consultantObj);
            };

        /**
         * update (consultant)
         */
        // FIXME - include an uuid check here also.
        this.update =
            function (consultant) {

                if (!(consultant instanceof Consultant)) {
                    return $q.reject('Wrong instance to ConsultantKeeper');
                }

                return this.journalize('Update', consultant);
            };

        /**
         * wipe it
         */
        this.nuke =
            function () {
                var entry =
                    new JournalEntry(null, new Date(), 'nukeConsultants', currentEventVersion, null);

                return JournalKeeper.compose(entry);
            };

        /**
         * read (consultant)
         */
        this.read = function (uuid) {
            return ArrayUtils.find(this.list(), 'uuid', uuid);
        };

        /**
         * list
         */
        this.list = function () {
            return angular.copy(consultants);
        };

        /**
         * get
         */
        this.get = function () {
            return angular.copy(consultants[0]);
        };

    }

    angular.module('tnt.catalog.consultant', [
        'tnt.catalog.consultant.entity', 'tnt.catalog.consultant.keeper'
    ]).run([
        'ConsultantKeeper', function (ConsultantKeeper) {
            // Warming up ConsultantKeeper
        }
    ]);

}(angular));
