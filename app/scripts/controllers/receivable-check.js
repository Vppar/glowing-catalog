(function(angular) {
    'use strict';
    angular.module('tnt.catalog.check.ctrl', [
        'tnt.catalog.check.service', 'tnt.utils.array'
    ]).controller(
            'ReceivableCheckCtrl',
            [
                '$scope', '$location', '$filter', 'UserService', 'CheckService', 'ArrayUtils',
                function($scope, $location, $filter, UserService, CheckService, ArrayUtils) {
                    // Login verify
                    UserService.redirectIfIsNotLoggedIn();

                    // ##################################################################################################
                    // LOCAL VARS
                    // ##################################################################################################
                    var dtFilterTemplate = {
                        dtInitial : new Date(),
                        dtFinal : new Date()
                    };

                    var STATE_DESCRIPTION_PT = 1;
                    var STATE_DESCRIPTION_ENG = 0;
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

                    // ##################################################################################################
                    // SCOPE VARS
                    // ##################################################################################################

                    // $scope.checks = CheckService.list();
                    $scope.checks = [
                        {
                            bank : 'Banco do Brasil',
                            agency : '3262-x',
                            account : 31254,
                            duedate : new Date(),
                            amount : 500,
                            state : 1
                        }, {
                            bank : 'Banco Brazuca',
                            agency : '3262-x',
                            account : 31254,
                            duedate : new Date(),
                            amount : 500,
                            state : 2
                        }, {
                            bank : 'Banco do Bozo',
                            agency : '3262-x',
                            account : 31254,
                            duedate : new Date(),
                            amount : 500,
                            state : 3
                        }, {
                            bank : 'Banco de Praça',
                            agency : '3262-x',
                            account : 31254,
                            duedate : new Date(),
                            amount : 500,
                            state : 4
                        }
                    ];
                    $scope.filteredChecks = angular.copy($scope.checks);

                    $scope.message = '';
                    $scope.allOpen = false;

                    $scope.selected = null;

                    $scope.toDeposit = true;
                    $scope.deposited = false;
                    $scope.moneyReceived = false;
                    $scope.returned = false;

                    // ##################################################################################################
                    // WATCHERS
                    // ##################################################################################################

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

                    $scope.$watchCollection('allOpen', function() {
                        if ($scope.allOpen === true) {
                            $scope.dtFilter.dtInitial = '';
                            $scope.dtIniDisabled = true;
                        } else {
                            $scope.dtFilter.dtInitial = new Date();
                            $scope.dtIniDisabled = false;
                        }
                    });

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
                     * Filter by State
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
                     * Translate the state name
                     */
                    function stateTranslator3000(checks) {
                        if ($scope.selected !== 'all') {
                            for ( var ix in checks) {
                                checks[ix].state = statesMap[checks[ix].state][STATE_DESCRIPTION_PT];
                            }
                        }else {
                            for ( var ix in checks) {
                                var x = Number(ix)+Number(1);
                                checks[ix].state = statesMap[x][STATE_DESCRIPTION_PT];
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