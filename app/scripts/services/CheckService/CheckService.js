(function(angular) {
    'use strict';

    angular.module('tnt.catalog.check.service', []).service('CheckService', [
        '$q', '$log', 'Check', 'CheckKeeper',

        /**
         * Service to handle check business logic.
         * 
         * @param {function} $q - Angular witchcraft.
         * @param {function} $log - Hmm...log?
         * @param {Check} Check - Check entity.
         * @param {CheckKeeper} CheckKeeper - Keeper that handle the DB
         *            management.
         */
        function CheckService($q, $log, Check, CheckKeeper) {
            var self = this;
            /**
             * Check if the current parameters for the check creation are valid
             * and if everything is OK send it to the keeper.
             * 
             * @param {check} - Object containing the data to create the Check
             *            in the DB.
             * @return {promise} - Rejected promise in case of errors or a
             *         JournalKeeper promise if everything is OK.
             */
            this.addCheck = function(check) {
                var result = null;

                var hasErrors = this.isValid(check);

                if (hasErrors.length === 0) {
                    var checkEntry = new Check(null, check.bank, check.agency, check.account, check.number, check.duedate, check.amount);
                    result = CheckKeeper.add(checkEntry);
                } else {
                    result = $q.reject(hasErrors);
                }
                return result;
            };

            /**
             * Validates the if there's a check for the given uuid and if the
             * transition is valid, then calls the Keeper or return a rejected
             * promise.
             * 
             * @param {String} - uuid of the desired check.
             * @param {Number} - position of the new state.
             * @return - JournalKeeper promise in case of success or a rejected
             *         promise with the error message.
             */
            this.changeState = function(uuid, newState) {
                var check = CheckKeeper.read(uuid);

                if (!(check instanceof Check)) {
                    return $q.reject('Couldn\'t find a check for the uuid: ' + uuid);
                }

                var result = validateStateTransition(check.state, newState);
                
                if (result) {
                    return CheckKeeper.changeState(uuid, newState);
                } else {
                    return $q.reject('Invalid transition from "' + check.state + '" to "' + newState + '"');
                }
            };

            /**
             * Returns the check of the given uuid.
             * 
             * @return {check} - Check obj.
             */
            this.read = function(uuid) {
                var result = null;
                try {
                    result = CheckKeeper.read(uuid);
                } catch (err) {
                    $log.debug('CheckService.read: Unable to find a check with the uuid=' + uuid + '. ' + 'Err=' + err);
                }
                return result;
            };

            /**
             * Returns the list of actual checks.
             * 
             * @return [array] - Array of checks.
             */
            this.list = function() {
                return CheckKeeper.list();
            };

            // ===========================================
            // Helpers
            // ===========================================

            /**
             * Validate all items of the object, and returns the invalid ones.
             * 
             * @param {item} - Object containing all the properties for the
             *            ObjCheck creation.
             * @return [Array] - Array with the invalid properties, empty if
             *         everything is OK.
             */
            this.isValid = function(item) {
                var invalidProperty = {};
                var now = new Date();

                // check all the obligatory properties.
                invalidProperty.bank = angular.isDefined(item.bank);
                invalidProperty.agency = angular.isDefined(item.agency);
                invalidProperty.account = angular.isDefined(item.account);
                invalidProperty.number = angular.isDefined(item.number);
                invalidProperty.duedate = angular.isDefined(item.duedate) && item.duedate <= now;
                invalidProperty.amount = angular.isDefined(item.amount) && angular.isNumber(item.amount) && item.amount > 0;

                var result = [];
                for ( var ix in invalidProperty) {
                    if (!invalidProperty[ix]) {
                        // Create a new empty object, set a
                        // property
                        // with the name of the invalid
                        // property,
                        // fill it with the invalid value and
                        // add to
                        // the result
                        var error = {};
                        error[ix] = item[ix];
                        result.push(error);
                    }
                }
                return result;
            };
           
            /**
             * Validates if the desired transition from A->B is possible.
             * 
             * @param - Current state of the Check.
             * @param - Desired state for the Check.
             * @return {boolean} - true if possible, false otherwise.
             */
            var validateStateTransition = function(currentState, newState) {
                var result = true;
                var resp = self.states()[currentState].indexOf(newState);
                if (resp === -1) {
                    result = false;
                }
                return result;
            };

            /**
             * Check States Map.
             */
            this.states = function() {
                return {
                    '1' : [
                        2, 3
                    ],
                    '2' : [
                        1, 4
                    ],
                    '3' : [
                        1, 4
                    ],
                    '4' : [
                        2, 3
                    ]
                };
            };
        }
    ]);
}(angular));