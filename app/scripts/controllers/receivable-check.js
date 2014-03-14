(function(angular) {
    'use strict';
    angular.module('tnt.catalog.check.ctrl', [
        'tnt.catalog.check.service', 'tnt.utils.array'
    ]).controller('ReceivableCheckCtrl', [
        '$log', '$q', '$scope', '$filter', 'UserService', 'CheckService', 'ArrayUtils', 'DataProvider',

        /**
         * Service to handle check business logic.
         * 
         * @param {function} $log - Hmm...log?
         * @param {function} $q - Angular witchcraft.
         * @param {function} $scope - scope.
         * @param {function} $filter - angular filter module.
         * @param {UserService} UserService - Service responsible for helping with the User data.
         * @param {CheckService} CheckService - Service responsible for checking
         *            the infos and passing forward to the keeper.
         * @param {ArrayUtils} ArrayUtils - Library of array utilities.
         */
        function($log, $q, $scope, $filter, UserService, CheckService, ArrayUtils, DataProvider) {
            // Login verify
            UserService.redirectIfIsNotLoggedIn();

            // ##################################################################################################
            // LOCAL VARS
            // ##################################################################################################
            var dtFilterTemplate = {
                dtInitial : new Date(),
                dtFinal : new Date()
            };

            /**
             * Map of translation for states.
             */
            var statesMap = {
                '1' : [
                    'toDeposit', 'a depositar'
                ],
                '2' : [
                    'deposited', 'depositado'
                ],
                '3' : [
                    'moneyReceived', 'recebido em dinheiro'
                ],
                '4' : [
                    'returned', 'devolvido'
                ]
            };
            
            /**
             * State translation constants.
             */
            var STATE_DESCRIPTION_PT = 1;
            var STATE_DESCRIPTION_ENG = 0;

            // ##################################################################################################
            // SCOPE VARS
            // ##################################################################################################

            $scope.checks = CheckService.list();
            
            $scope.filteredChecks = angular.copy($scope.checks);
            
            $scope.allChecks = false;
            
            $scope.message = '';
            
            var banksMap = DataProvider.banks;
            
            /**
             * Object containing all the checkBoxes values.
             */
            $scope.boxes = {};
            
            /**
             * SelectButton group.
             */
            $scope.selected = null;

            /**
             * StateButtons visibility.
             */
            $scope.toDeposit = true;
            $scope.deposited = false;
            $scope.moneyReceived = false;
            $scope.returned = false;

            // ##################################################################################################
            // SCOPE FUNCTIONS
            // ##################################################################################################

            /**
             * Change the selected checks to the desired state.
             * 
             * @return {promise} - Returns a promise with the result of the
             *         operation.
             */
            $scope.changeState = function(newState) {
                var promises = [];

                for ( var ix in $scope.boxes) {
                    if ($scope.boxes[ix] === true) {
                        promises.push(CheckService.changeState($scope.filteredChecks[ix].uuid, newState));
                    }
                }

                var promise = $q.all(promises);
                var resolvedPromises = promise.then(function() {
                    $log.info('State Changed!');
                }, function(err) {
                    $log.error('Failed to change state!');
                    $log.debug(err);
                    return $q.reject();
                });

                return resolvedPromises;
            };

            // ##################################################################################################
            // WATCHERS
            // ##################################################################################################

            /**
             * Watcher for the SelectButton group.
             * Handle the behavior of the components in the screen based on the button selected;
             */
            $scope.$watchCollection('selected', function() {
                if ($scope.selected === 'toDeposit') {
                    $scope.toDeposit = false;
                    $scope.deposited = true;
                    $scope.moneyReceived = true;
                    $scope.returned = false;
                    $scope.message = 'todos a depositar até ';
                } else if ($scope.selected === 'deposited') {
                    $scope.toDeposit = true;
                    $scope.deposited = false;
                    $scope.moneyReceived = false;
                    $scope.returned = true;
                    $scope.message = 'todos depositados até ';
                } else if ($scope.selected === 'moneyReceived') {
                    $scope.toDeposit = true;
                    $scope.deposited = false;
                    $scope.moneyReceived = false;
                    $scope.returned = true;
                    $scope.message = 'todos recebios em dinheiro até ';
                } else if ($scope.selected === 'returned') {
                    $scope.toDeposit = false;
                    $scope.deposited = true;
                    $scope.moneyReceived = true;
                    $scope.returned = false;
                    $scope.message = 'todos devolvidos até ';
                } else if ($scope.selected === 'all') {
                    $scope.toDeposit = false;
                    $scope.deposited = false;
                    $scope.moneyReceived = false;
                    $scope.returned = false;
                    $scope.message = 'todos até ';
                }
                $scope.filteredChecks = $filter('filter')(angular.copy($scope.checks), filterByDate);
                $scope.filteredChecks = filterByState($scope.filteredChecks);
            });

            /**
             * AllChecks checkBox watcher.
             * Shows all check until X date.
             */
            $scope.$watchCollection('allChecks', function() {
                if ($scope.allChecks === true) {
                    $scope.dtFilter.dtInitial = '';
                    $scope.dtIniDisabled = true;
                } else {
                    $scope.dtFilter.dtInitial = new Date();
                    $scope.dtIniDisabled = false;
                }
            });
            
            /**
             * DateFilter watcher.
             */
            $scope.$watchCollection('dtFilter', function() {
                $scope.filteredChecks = $filter('filter')(angular.copy($scope.checks), filterByDate);
                $scope.filteredChecks = filterByState($scope.filteredChecks);
            });

            // ##################################################################################################
            // Auxiliary functions
            // ##################################################################################################
            
            function setTime(date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
                return date;
            }

            function initializeDates(date) {
                if (!date) {
                    date = angular.copy(dtFilterTemplate);
                }

                if (!(date.dtInitial instanceof Date)) {
                    date.dtInitial = setTime(new Date(), 0, 0, 0, 0);
                } else {
                    date.dtInitial = setTime(date.dtInitial, 0, 0, 0, 0);
                }

                if (!(date.dtFinal instanceof Date)) {
                    date.dtFinal = setTime(new Date(), 23, 59, 59, 999);
                } else {
                    date.dtFinal = setTime(date.dtFinal, 23, 59, 59, 999);
                }

                return date;
            }

            /**
             * DateFilter
             */
            function filterByDate(check) {
                var initialFilter = null;
                var finalFilter = null;
                var isDtInitial = false;
                var isDtFinal = false;
                if ($scope.dtFilter.dtInitial instanceof Date) {

                    $scope.dtFilter.dtInitial = setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);

                    initialFilter = $scope.dtFilter.dtInitial.getTime();

                    isDtInitial = true;
                }
                if ($scope.dtFilter.dtFinal instanceof Date) {

                    $scope.dtFilter.dtFinal = setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
                    finalFilter = $scope.dtFilter.dtFinal.getTime();

                    isDtFinal = true;
                }

                if (isDtInitial && isDtFinal) {
                    if ($scope.dtFilter.dtInitial.getTime() > $scope.dtFilter.dtFinal.getTime()) {
                        $scope.dtFilter.dtFinal = angular.copy($scope.dtFilter.dtInitial);
                    }
                }

                if (initialFilter && finalFilter) {
                    if (check.duedate >= initialFilter && check.duedate <= finalFilter) {
                        return true;
                    }
                    return false;
                } else if (initialFilter) {
                    if (check.duedate >= initialFilter) {
                        return true;
                    }
                    return false;
                } else if (finalFilter) {
                    if (check.duedate <= finalFilter) {
                        return true;
                    }
                    return false;
                } else {
                    return true;
                }
            }

            /**
             * Filter by State.
             */
            function filterByState(checks) {
                if ($scope.selected === 'all') {
                    return stateTranslator3000(checks);
                }
                var stateChecks = [];
                for ( var ix in checks) {
                    if (statesMap[checks[ix].state][STATE_DESCRIPTION_ENG] === $scope.selected) {
                        stateChecks.push(checks[ix]);
                    }
                }
                if (stateChecks.length === 0) {
                    return stateChecks;
                }
                return stateTranslator3000(stateChecks);
            }

            /**
             * Translate the state name.
             * 
             * @param [Checks] - An array of Checks.
             * @return [checks] - An array of Checks with the state translated.
             */
            function stateTranslator3000(checks) {
                if ($scope.selected !== 'all') {
                    for ( var ix in checks) {
                        checks[ix].state = statesMap[checks[ix].state][STATE_DESCRIPTION_PT];
                    }
                } else {
                    for ( var ix2 in checks) {
                        var x = Number(ix2) + Number(1);
                        checks[ix2].state = statesMap[x][STATE_DESCRIPTION_PT];
                    }
                }
                return bankTranslator3000(checks);
            }
            
            /**
             * Translate the bank code.
             * 
             * @param [Checks] - An array of Checks.
             * @return [checks] - An array of Checks with the bank translated.
             */
            function bankTranslator3000(checks) {
                    for ( var ix in checks) {
                        var bankCode = checks[ix].bank;
                        if(banksMap[bankCode]){
                            checks[ix].bank = banksMap[bankCode];
                        }
                    }
                    return checks;
                }

            // ###################################
            // WARM UP
            // ###################################
            $scope.dtFilter = initializeDates($scope.dtFilter);
        }
    ]);
}(angular));
