/**
 * @author Thiago Classen
 */

(function(angular) {
    'use strict';

    /**
     * Target entity
     */
    angular.module('tnt.catalog.target.entity', []).factory('Target', function Target() {

        /**
         * Factory that creates the Target Object.
         */
        var service = function svc(uuid, targets, type, totalAmount, name) {

            var validProperties = [
                'uuid', 'targets', 'type', 'totalAmount', 'name'
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
                    throw 'Target must be initialized with uuid, targets, type, totalAmount, name';
                }
            } else {
                this.uuid = uuid;
                this.targets = targets;
                this.type = type;
                this.totalAmount = totalAmount;
                this.name = name;
            }

            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'targets', this.targets);
            ObjectUtils.ro(this, 'type', this.type);
            ObjectUtils.ro(this, 'totalAmount', this.totalAmount);
            ObjectUtils.ro(this, 'name', this.name);
        };

        return service;
    });

    /**
     * The keeper for the current targets
     */
    angular.module(
        'tnt.catalog.target.keeper',
        ['tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper', 'tnt.catalog.target.entity',
            'tnt.utils.array', 'tnt.identity'
        ]).service('TargetKeeper', [
            'ArrayUtils', 'Replayer', 'JournalEntry', 'JournalKeeper', 'IdentityService', 'Target',

            /**
             * Keeper that handle the target data.
             *
             * @param {ArrayUtils} ArrayUtils - Array utilities.
             * @param {Replayer} Replayer - Class that handles the Journal Entries.
             * @param {JournalEntry} JournalEntry - JournalEntry Entity.
             * @param {JournalKeeper} JournalKeeper - Handle journal data.
             * @param {IdentityService} IdentityService - Service that creates the
             *            uuids.
             */
                function targetKeeper(ArrayUtils, Replayer, JournalEntry, JournalKeeper, IdentityService, Target) {
                var type = 19;
                var targets = [];
                this.handlers = {};
                var currentCounter = 0;
                var currentEventVersion = 1;

                function getNextId() {
                    return ++currentCounter;
                }

                /**
                 * Create the final target object and push it to the DataBase
                 *
                 * @param {event} - Object containing the nescessary data to create the target.
                 */
                ObjectUtils.ro(this.handlers, 'targetAddV1', function(event) {
                    var eventData = IdentityService.getUUIDData(event.uuid);

                    if (eventData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new Target(event);
                    targets.push(event);

                    return event.uuid;
                });

                /**
                 * Updates target object.
                 *
                 * @param {event} - Object to be updated.
                 */
                ObjectUtils.ro(this.handlers, 'targetUpdateV1', function(event) {
                    var oldTarget = ArrayUtils.find(targets, 'uuid', event.uuid);

                    targets[targets.indexOf(oldTarget)] = event;

                    return event.uuid;
                });

                /**
                 * Registering the handlers with the Replayer
                 */
                Replayer.registerHandlers(this.handlers);

                /**
                 * Adds a target to the list.
                 *
                 * @param target - target object to be added.
                 */
                this.add = function(target) {

                    if (!(target instanceof Target)) {
                        return $q.reject('Wrong instance of target');
                    }

                    var targetObj = angular.copy(target);

                    var stamp = (new Date()).getTime();
                    targetObj.uuid = IdentityService.getUUID(type, getNextId());

                    var event = new Target(targetObj);

                    // create a new journal entry
                    var entry = new JournalEntry(null, stamp, 'targetAdd', currentEventVersion, event);

                    // save the journal entry
                    return JournalKeeper.compose(entry);

                };

                /**
                 * Updates a target.
                 *
                 * @param target - target object to be updated.
                 */
                this.update = function(target) {

                    if (!(target instanceof Target)) {
                        return $q.reject('Wrong instance of target');
                    }

                    var targetObj = angular.copy(target);

                    var stamp = (new Date()).getTime();

                    var event = new Target(targetObj);

                    // create a new journal entry
                    var entry = new JournalEntry(null, stamp, 'targetUpdate', currentEventVersion, event);

                    // save the journal entry
                    return JournalKeeper.compose(entry);

                };

                /**
                 * Returns a copy of all targets.
                 *
                 * @return Array - targets.
                 */
                this.list = function list() {
                    return angular.copy(targets);
                };

                /**
                 * Return a copy of a target by its uuid
                 *
                 * @param uuid - uuid of a target.
                 */
                this.read = function read(uuid) {
                    return angular.copy(ArrayUtils.find(targets, 'uuid', uuid));
                };


                //##########################################################################################################################
                //Utils
                //##########################################################################################################################

                /**
                 * gets a date and formats to a string on yyyy-MM-dd format
                 *
                 * @param date
                 * @returns {string}
                 */

                function dateFormatter(date){
                    date = new Date(date);
                    var yyyy = date.getFullYear().toString();
                    var mm = (date.getMonth()+1).toString();
                    var dd  = date.getDate().toString();
                    return yyyy +'-' +(mm[1]?mm:"0"+mm[0]) + '-' +(dd[1]?dd:"0"+dd[0]);
                };

                /**
                 * Getas a target obj and return a obj array, with the compatible format for the bi.
                 *
                 *
                 * @param target
                 * @returns {Array}
                 */

                function translator(target){
                    var intervals =[];

                    for(var ix in target){
                        var date = target[ix].initial;

                        date = dateFormatter(date);

                        intervals[date] = {
                            order : Number(ix)+Number(1),
                            goal : target[ix].splitSum,
                            snapshot: 0,
                            label : 'sem '+ (Number(ix)+Number(1))
                        };
                    };

                    return intervals;
                };
            }
        ]);

    angular.module('tnt.catalog.target', [
        'tnt.catalog.target.entity', 'tnt.catalog.target.keeper'
    ]).run([
        'TargetKeeper', function(TargetKeeper) {
            // Warming up TargetKeeper
        }
    ]);

}(angular));
