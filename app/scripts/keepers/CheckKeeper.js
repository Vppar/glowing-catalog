/**
 * @author Thiago Classen
 */

(function(angular) {
    'use strict';

    /**
     * Check entity
     */
    angular.module('tnt.catalog.check.entity', []).factory('Check', function Check() {

        /**
         * Factory that creates the Check Object.
         * 
         * @param {string} uuid - User Unique Id.
         * @param {string} bank - Check bank code
         * @param {string} agency - Check agency code.
         * @param {string} number - Check number code.
         * @param {Date} duedate - Check duedate.
         * @param {number} amount - Check amount.
         */
        var service = function svc(uuid, bank, agency, account, number, duedate, amount) {

            var validProperties = [
                'uuid', 'bank', 'agency', 'account', 'number', 'duedate', 'amount', 'document'
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

            if (arguments.length !== svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Check must be initialized with uuid, bank, agency, account, number, duedate and amount';
                }
            } else {
                this.uuid = uuid;
                this.bank = bank;
                this.agency = agency;
                this.account = account;
                this.number = number;
                this.duedate = duedate;
                this.amount = amount;
            }

            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'bank', this.bank);
            ObjectUtils.ro(this, 'agency', this.agency);
            ObjectUtils.ro(this, 'account', this.account);
            ObjectUtils.ro(this, 'number', this.number);
            ObjectUtils.ro(this, 'duedate', this.duedate);
            ObjectUtils.ro(this, 'amount', this.amount);
        };

        return service;
    });

    /**
     * The keeper for the current check
     */
    angular.module(
            'tnt.catalog.check.keeper',
            ['tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper', 'tnt.catalog.check.entity',
                'tnt.utils.array', 'tnt.identity'
            ]).service('CheckKeeper', [
        'ArrayUtils', 'Replayer', 'JournalEntry', 'JournalKeeper', 'IdentityService', 'Check',

        /**
         * Keeper that handle the check data.
         * 
         * @param {ArrayUtils} ArrayUtils - Array utilities.
         * @param {Replayer} Replayer - Class that handles the Journal Entries.
         * @param {JournalEntry} JournalEntry - JournalEntry Entity.
         * @param {JournalKeeper} JournalKeeper - Handle journal data.
         * @param {IdentityService} IdentityService - Service that creates the
         *            uuids.
         */
        function CheckKeeper(ArrayUtils, Replayer, JournalEntry, JournalKeeper, IdentityService, Check) {
            var self = this;
            var type = 10;
            var checks = [];
            this.handlers = {};
            var currentCounter = 0;
            var currentEventVersion = 1;

            function getNextId() {
                return ++currentCounter;
            }

            /**
             * Create the final check object and push it to the DataBase
             * 
             * @param {event} - Object containing the nescessary data to create
             *            the check.
             */
            ObjectUtils.ro(this.handlers, 'checkAddV1', function(event) {
                var eventData = IdentityService.getUUIDData(event.uuid);

                if (eventData.deviceId === IdentityService.getDeviceId()) {
                    currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                }

                event = new Check(event);
                // Always create the check at state 1.
                event.state = 1;
                checks.push(event);

                return event.uuid;
            });

            /**
             * Get the check of the given uuid and replace the current state
             * with the new one.
             * 
             * @param {event} - Object containing the uuid of the check and his
             *            new state.
             */
            ObjectUtils.ro(this.handlers, 'checkChangeStateV1', function(event) {

                var check = ArrayUtils.find(checks, 'uuid', event.uuid);
                check.state = event.state;

                return event.uuid;
            });
            
            /**
             * Registering the handlers with the Replayer
             */
            Replayer.registerHandlers(this.handlers);

            /**
             * Adds a check to the list.
             * 
             * @param check - Check object to be added.
             */
            this.add = function(check) {

                if (!(check instanceof Check)) {
                    return $q.reject('Wrong instance of Check');
                }

                var checkObj = angular.copy(check);

                var stamp = (new Date()).getTime();
                checkObj.uuid = IdentityService.getUUID(type, getNextId());

                var event = new Check(checkObj);

                // create a new journal entry
                var entry = new JournalEntry(null, stamp, 'checkAdd', currentEventVersion, event);

                // save the journal entry
                return JournalKeeper.compose(entry);

            };

            /**
             * Changes the state of a currently existing check.
             * 
             * @param uuid - uuid of a check.
             * @param newState - the new state for the given check.
             */
            this.changeState = function(uuid, newState) {

                var check = self.read(uuid);

                if (!check) {
                    return $q.reject('Couldn\'t find a check for the uuid: ' + uuid);
                }

                check.state = newState;

                var stamp = (new Date()).getTime();
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, 'checkChangeState', currentEventVersion, check);
                // save the journal entry
                return JournalKeeper.compose(entry);

            };

            /**
             * Returns a copy of all checks.
             * 
             * @return Array - Checks.
             */
            this.list = function list() {
                return angular.copy(checks);
            };

            /**
             * Return a copy of a check by its uuid
             * 
             * @param uuid - uuid of the target check.
             */
            this.read = function read(uuid) {
                return angular.copy(ArrayUtils.find(checks, 'uuid', uuid));
            };
        }
    ]);

    angular.module('tnt.catalog.check', [
        'tnt.catalog.check.entity', 'tnt.catalog.check.keeper'
    ]).run([
        'CheckKeeper', function(CheckKeeper) {
            // Warming up CheckKeeper
        }
    ]);

}(angular));
