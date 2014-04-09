(function(angular) {
    'use strict';

    angular.module('tnt.catalog.pagpop', [
        'tnt.catalog.user', 'tnt.catalog.receivable.service', 'tnt.utils.array'
    ]).controller(
            'PagpopCtrl',
            [
                '$scope', '$filter', 'EntityService', 'UserService', 'ReceivableService', 'ArrayUtils', 'FinancialMathService',
                function($scope, $filter, EntityService, UserService, ReceivableService, ArrayUtils, FinancialMathService) {

                    UserService.redirectIfIsNotLoggedIn();

                    $scope.searchClient = '';
                    $scope.ccTax = 3.48;

                    var receivables = ReceivableService.list();
                    var creditCardReceivables = ArrayUtils.list(receivables, 'type', 'creditCard');

                    var pagpopReceivables = [];
                    for (var idx in creditCardReceivables) {
                        if (!angular.isUndefined(creditCardReceivables[idx].payment.gatewayInfo)) {
                            pagpopReceivables.push(augment(creditCardReceivables[idx]));
                        }
                    }
                    
                    creditCardReceivables = pagpopReceivables;
                    console.log(creditCardReceivables);
                    function augment(receivable){
                        var amount = receivable.amount;
                        var ccTax = $scope.ccTax;
                        var result = FinancialMathService.currencyDivide((amount * ccTax), 100);
                        var ccTaxPowered = Math.pow(1.98, receivable.payment.installments);
                        console.log('>>>>>>>>>Total amount ', amount);
                        console.log('>>>>>>>>>Total - default tax', result );
                        var ccTaxAmount = FinancialMathService.currencyDivide((amount * ccTaxPowered), 100);
                        console.log('>>>>>>>>>Total - installmentTax', ccTaxAmount);
                        result +=ccTaxAmount; 
                        
                        receivable.amountLiquid = amount - result;
                        return receivable;
                    }
                    
                    /**
                     * DateFilter watcher.
                     */
                    $scope.$watchCollection('dtFilter', function() {
                        $scope.filteredReceivables = $filter('filter')(angular.copy(creditCardReceivables), filterByDate);
                        clientNames();
                        $scope.filteredReceivables = $filter('filter')($scope.filteredReceivables, filterByEntity);
                        summarizer();
                    });

                    /**
                     * EntityFilter watcher.
                     */
                    $scope.$watchCollection('searchClient', function() {
                        $scope.filteredReceivables = $filter('filter')(angular.copy(creditCardReceivables), filterByDate);
                        clientNames();
                        $scope.filteredReceivables = $filter('filter')($scope.filteredReceivables, filterByEntity);
                        summarizer();
                    });

                    /**
                     * Get the name of all clients based on the clientUUID on the payment
                     */
                    function clientNames() {
                        for ( var idx in $scope.filteredReceivables) {
                            $scope.filteredReceivables[idx].name = EntityService.read($scope.filteredReceivables[idx].entityId).name;
                        }
                    }

                    /**
                     * Summarizer
                     */
                    function summarizer() {
                        $scope.total = 0;
                        $scope.totalLiquid = 0;
                        for ( var idx in $scope.filteredReceivables) {
                            //$scope.filteredReceivables[idx].amountLiquid = FinancialMathService.currencyMultiply($scope.filteredReceivables[idx].amount, 0.9652);
                            $scope.total += $scope.filteredReceivables[idx].amount;
                            $scope.totalLiquid += $scope.filteredReceivables[idx].amountLiquid;
                        }

                        var payments = ArrayUtils.distinct($scope.filteredReceivables, 'payment');

                        $scope.numCustomers = ArrayUtils.distinct(payments, 'owner').length;

                        $scope.numOrders = ArrayUtils.distinct($scope.filteredReceivables, 'documentId').length;
                    }

                    // #########################################################################################################
                    // Filter related
                    // #########################################################################################################

                    function filterByEntity(cc) {
                        var clientName = $scope.searchClient.toLowerCase();

                        if (clientName === '') {
                            return true;
                        } else {
                            if (cc.name.toLowerCase().indexOf(clientName) >= 0) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }

                    var dtFilterTemplate = {
                        dtInitial : new Date(),
                        dtFinal : new Date()
                    };

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
                    function filterByDate(cc) {
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
                            if (cc.created >= initialFilter && cc.created <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else if (initialFilter) {
                            if (cc.created >= initialFilter) {
                                return true;
                            }
                            return false;
                        } else if (finalFilter) {
                            if (cc.created <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else {
                            return true;
                        }
                    }

                    // ###################################
                    // WARM UP
                    // ###################################
                    $scope.dtFilter = initializeDates($scope.dtFilter);
                }
            ]);
})(angular);