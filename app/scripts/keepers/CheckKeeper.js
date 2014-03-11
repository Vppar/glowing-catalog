/**
 * @author Thiago Classen
 */

(function(angular) {
    'use strict';

    /**
     * Check entity
     */
    angular.module('tnt.catalog.check.entity', []).factory('Check', function Check() {

        var service = function svc(uuid, installments, bank, agency, account, number, duedate, amount) {

            var validProperties = [
                'uuid', 'installments', 'bank', 'agency', 'account', 'number', 'duedate', 'amount'
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
                    throw 'Check must be initialized with uuid, installments, bank, agency, account, number, duedate and amount';
                }
            } else {
                this.uuid = uuid;
                this.installments = installments;
                this.bank = bank;
                this.agency = agency;
                this.account = account;
                this.number = number;
                this.duedate = duedate;
                this.amount = amount;
            }

            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'installments', this.installments);
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
            [
                'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper', 'tnt.catalog.check.entity',
                'tnt.utils.array', 'tnt.identity'
            ]).service(
            'CheckKeeper',
            [
                'ArrayUtils', 'Replayer', 'JournalEntry', 'JournalKeeper', 'IdentityService', 'Check',
                function CheckKeeper(ArrayUtils, Replayer, JournalEntry, JournalKeeper, IdentityService, Check) {

                    var type = 10;
                    var checks = [];
                    this.handlers = {};
                    var currentCounter = 0;
                    var currentEventVersion = 1;

                    function getNextId() {
                        return ++currentCounter;
                    }

                    /**
                     * Registering handlers
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

                    ObjectUtils.ro(this.handlers, 'checkChangeStateV1', function(event) {

                        var eventData = IdentityService.getUUIDData(event.uuid);

                        if (eventData.deviceId === IdentityService.getDeviceId()) {
                            currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                        }
                        
                        var check = ArrayUtils.find(checks, 'uuid', event.uuid);
                        check.state = event.state;

                        return event.uuid;
                    });

                    /**
                     * Adds a check to the list.
                     * 
                     * @param check - Check to be added.
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

                        var check = read(uuid);
                        
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
                    var read = function read(uuid) {
                        return angular.copy(ArrayUtils.find(checks, 'uuid', uuid));
                    };
                }
            ]);

    angular.module('tnt.catalog.Check', [
        'tnt.catalog.check.entity', 'tnt.catalog.check.keeper'
    ]).run([
        'CheckKeeper', function(CheckKeeper) {
            // Warming up EntityKeeper
        }
    ]);

}(angular));
