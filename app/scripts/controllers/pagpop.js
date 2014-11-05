(function (angular) {
    'use strict';

    angular.module('tnt.catalog.pagpop', [
        'tnt.catalog.user', 'tnt.catalog.receivable.service', 'tnt.utils.array', 'tnt.catalog.card.config.service'
    ])
        .controller(
            'PagpopCtrl',
            [
                '$scope',
                '$filter',
                'EntityService',
                'UserService',
                'ReceivableService',
                'ArrayUtils',
                'FinancialMathService',
                'CardConfigService',
                function ($scope, $filter, EntityService, UserService, ReceivableService,
                    ArrayUtils, FinancialMathService, CardConfigService) {

                    var PP_FIXED_RATIO = 3.48;
                    var PP_MONTHLY_RATIO = 1.98;

                    UserService.redirectIfInvalidUser();

                    $scope.searchClient = '';

                    $scope.maxDate = new Date();

                    var receivables = ReceivableService.list();
                    var creditCardReceivables = ArrayUtils.list(receivables, 'type', 'creditCard');

                    var pagpopReceivables = [];
                    
                    
                    //augment
                    for ( var idx in creditCardReceivables) {
                        var receivable = creditCardReceivables[idx];
                        if (!angular.isUndefined(receivable.payment.gatewayInfo)) {
                            receivable.transacao = receivable.gatewayInfo.transacao.numero_autorizacao;
                            pagpopReceivables.push(augment(receivable));
                        } else {                            
                            if(receivable.payment.extInfo){
                                receivable.transacao = receivable.payment.extInfo.transacao.numero_autorizacao;
                            }
                            pagpopReceivables.push(applyDiscountReceivableWithoutGatweayInfo(receivable));
                        }
                    }

                    creditCardReceivables = pagpopReceivables;

                    function applyDiscountReceivableWithoutGatweayInfo (receivable) {

                        if(receivable.payment && receivable.payment.installments) {
                            var fee = CardConfigService.getCreditCardFeeByInstallments(receivable.payment.installments);
                            if(fee) {
                                var netAmount = FinancialMathService.currencyPercentageSubtract(receivable.amount, fee);
                                var discount = FinancialMathService.currencySubtract(receivable.amount, netAmount);

                                receivable.netAmount = netAmount;
                                receivable.discount = discount;

                                return receivable;
                            }
                        }
                        receivable.netAmount = receivable.amount;
                        receivable.discount = 0;
                        return receivable;                                           
                    }

                    function augment (receivable) {
                        var installments = receivable.payment.installments;
                        var netAmount =
                            FinancialMathService.presentValue(
                                PP_FIXED_RATIO,
                                PP_MONTHLY_RATIO,
                                installments,
                                receivable.amount);
                        var discount =
                            FinancialMathService.currencySubtract(receivable.amount, netAmount);

                        receivable.netAmount = netAmount;
                        receivable.discount = discount;

                        return receivable;
                    }

                    /**
                     * DateFilter watcher.
                     */
                    $scope.$watchCollection('dtFilter', function () {
                        $scope.filteredReceivables =
                            $filter('filter')(angular.copy(creditCardReceivables), filterByDate);
                        clientNames();
                        $scope.filteredReceivables =
                            $filter('filter')($scope.filteredReceivables, filterByEntity);
                        summarizer();
                    });

                    /**
                     * EntityFilter watcher.
                     */
                    $scope.$watchCollection('searchClient', function () {
                        $scope.filteredReceivables =
                            $filter('filter')(angular.copy(creditCardReceivables), filterByDate);
                        clientNames();
                        $scope.filteredReceivables =
                            $filter('filter')($scope.filteredReceivables, filterByEntity);
                        summarizer();
                    });

                    /**
                     * Get the name of all clients based on the clientUUID on
                     * the payment
                     */
                    function clientNames () {
                        for ( var idx in $scope.filteredReceivables) {
                            $scope.filteredReceivables[idx].name =
                                EntityService.read($scope.filteredReceivables[idx].entityId).name;
                        }
                    }

                    /**
                     * Summarizer
                     */
                    function summarizer () {
                        $scope.total = 0;
                        $scope.netTotal = 0;
                        $scope.discountTotal = 0;
                        for ( var idx in $scope.filteredReceivables) {
                            $scope.total += $scope.filteredReceivables[idx].amount;
                            $scope.netTotal += $scope.filteredReceivables[idx].netAmount;
                            $scope.discountTotal += $scope.filteredReceivables[idx].discount;
                        }

                        var payments = ArrayUtils.distinct($scope.filteredReceivables, 'payment');

                        $scope.numCustomers = ArrayUtils.distinct(payments, 'owner').length;

                        $scope.numOrders =
                            ArrayUtils.distinct($scope.filteredReceivables, 'documentId').length;
                    }

                    // #########################################################################################################
                    // Filter related
                    // #########################################################################################################

                    function filterByEntity (cc) {
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

                    function setTime (date, hours, minutes, seconds, milliseconds) {
                        date.setHours(hours);
                        date.setMinutes(minutes);
                        date.setSeconds(seconds);
                        date.setMilliseconds(milliseconds);
                        return date;
                    }

                    function initializeDates (date) {
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
                    function filterByDate (cc) {
                        var initialFilter = null;
                        var finalFilter = null;
                        var isDtInitial = false;
                        var isDtFinal = false;
                        if ($scope.dtFilter.dtInitial instanceof Date) {

                            $scope.dtFilter.dtInitial =
                                setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);

                            initialFilter = $scope.dtFilter.dtInitial.getTime();

                            isDtInitial = true;
                        }
                        if ($scope.dtFilter.dtFinal instanceof Date) {

                            $scope.dtFilter.dtFinal =
                                setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
                            finalFilter = $scope.dtFilter.dtFinal.getTime();

                            isDtFinal = true;
                        }

                        if (isDtInitial && isDtFinal) {
                            if ($scope.dtFilter.dtInitial.getTime() > $scope.dtFilter.dtFinal
                                .getTime()) {
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