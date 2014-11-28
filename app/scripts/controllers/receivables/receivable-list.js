(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.list.ctrl', ['tnt.catalog.financial.math.service', 'tnt.catalog.card.config.service']).controller(
            'ReceivableListCtrl',
            [
                '$log', '$scope', '$filter', 'ReceivableService', 'EntityService', 'OrderService', 'IdentityService', 'BookService', 'Book', 'FinancialMathService', 'CardConfigService',
                function($log, $scope, $filter, ReceivableService, EntityService, OrderService, IdentityService, BookService, Book, FinancialMathService, CardConfigService) {
                    
                    var PP_FIXED_RATIO = 3.48;
                    var PP_MONTHLY_RATIO = 1.98;
                    
                    function setTime(date, hours, minutes, seconds, milliseconds) {
                        date.setHours(hours);
                        date.setMinutes(minutes);
                        date.setSeconds(seconds);
                        date.setMilliseconds(milliseconds);
                        return date;
                    }

                    // ############################
                    // TRASNLATOR TABAJARA
                    // ############################
                    var translate = {};
                    translate.onCuff = 'Saldo a receber';
                    translate.check = 'Cheque';
                    translate.creditCard = 'Cartão de Crédito';
                    translate.cash = 'Dinheiro';

                    // ################
                    // FILTERS RELATED
                    // ###############
                    function filterByDate(receivable) {
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
                        var date = undefined;
                        if ($scope.selectedReceivableMode === 'listOpen') {
                            date = receivable.duedate;
                        } else if ($scope.selectedReceivableMode === 'listClosed') {
                            date = receivable.liquidated;
                        }

                        if (initialFilter && finalFilter) {
                            if (date >= initialFilter && date <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else if (initialFilter) {
                            if (date >= initialFilter) {
                                return true;
                            }
                            return false;
                        } else if (finalFilter) {
                            if (date <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else {
                            return true;
                        }
                    }

                    function receivableCanceledFilter(receivable) {
                        var result = (receivable.canceled === undefined);
                        return result;
                    }

                    function receivableLiquidatedFilter(receivable) {
                        var result = (receivable.liquidated === undefined);
                        return result;
                    }

                    function filterReceivablesByDate(receivables) {
                        return $filter('filter')(receivables, filterByDate);
                    }

                    function filterByCanceled(receivables) {
                        return $filter('filter')(receivables, receivableCanceledFilter);
                    }

                    function filterByLiquidated(receivables) {
                        return $filter('filter')(receivables, receivableLiquidatedFilter);
                    }

                    /**
                     * FILTER RECEIVABLES
                     */
                    function filterReceivables(newVal, oldVal) {
                        var receivables = ReceivableService.listActive();

                        receivables = filterReceivablesByDate(receivables);

                        hourReset(receivables);

                        if ($scope.selectedReceivableMode === 'listOpen') {
                            receivables = filterReceivablesByLiquidated(receivables);
                            if (newVal === 'listOpen') {
                                $scope.allOpenReceivables = 'true';
                            }
                            if($scope.disable) {
                                $scope.disable.discount = false;
                                $scope.disable.extra = false;
                            }
                        } else {
                            if($scope.disable) {
                                $scope.disable.discount = true;
                                $scope.disable.extra = true;
                            }

                            $scope.allOpenReceivables = 'false';
                            receivables = filterReceivablesByClosed(receivables);
                        }
                        
                        if($scope.selectedReceivableMode === 'listOpen'){
                            receivables = $filter('orderBy')(receivables, ['duedate', '-created']);
                        }else{
                            receivables = $filter('orderBy')(receivables, '-liquidated');
                        }

                        $scope.receivables.list = argumentReceivables(receivables);
                    }

                    function hourReset(receivables){
                        for(var ix in receivables){
                            receivables[ix].created = new Date(receivables[ix].created).setHours(0);
                            receivables[ix].created = new Date(receivables[ix].created).setMinutes(0);
                            receivables[ix].created = new Date(receivables[ix].created).setSeconds(0);
                            receivables[ix].created = new Date(receivables[ix].created).setMilliseconds(0);

                            receivables[ix].duedate = new Date(receivables[ix].duedate).setHours(0);
                            receivables[ix].duedate = new Date(receivables[ix].duedate).setMinutes(0);
                            receivables[ix].duedate = new Date(receivables[ix].duedate).setSeconds(0);
                            receivables[ix].duedate = new Date(receivables[ix].duedate).setMilliseconds(0);
                        }
                    }

                    function filterReceivablesByLiquidated(receivables) {
                        return $filter('filter')(receivables, receivableLiquidateFilter);
                    }
                    function filterReceivablesByClosed(receivables) {
                        return $filter('filter')(receivables, receivableClosedFilter);
                    }

                    function receivableLiquidateFilter(receivable) {
                        return (receivable.liquidated === undefined);
                    }

                    function receivableClosedFilter(receivable) {
                        return (receivable.liquidated !== undefined);
                    }

                    function ensureDateOrder() {
                        if ($scope.dtFilter.dtInitial > $scope.dtFilter.dtFinal) {
                            var initial = $scope.dtFilter.dtInitial, final = $scope.dtFilter.dtFinal;

                            $scope.dtFilter.dtInitial = final;
                            $scope.dtFilter.dtFinal = initial;
                        }
                    }
                    // #############################
                    // ARGUMENT RECEIVABLES
                    // #############################

                    function argumentReceivables(receivables) {
                        $scope.sumAmount = 0;
                        $scope.sumItens = 0;
                        for ( var ix in receivables) {
                            $scope.sumItens++;
                            var receivable = receivables[ix];
                            receivable.entityName = EntityService.read(receivable.entityId).name;
                            receivable.typeTranslated = translate[receivable.type];
                            
                            if(receivable.type === 'creditCard' && !angular.isUndefined(receivable.payment.gatewayInfo)){
                                //overwrite the amount with the net amount.
                                receivable.amount = getNetAmountForCreditCardWithGateway(receivable); 
                            } else {
                                receivable.amount = getNetAmountForCreditCardWithoutGateway(receivable); 
                            }
                                                       
                            $scope.sumAmount += receivable.amount;
                            
                            // This section prevents that warmup inputed checks
                            // generate an error for not having a documentId
                            if (receivable.documentId) {
                                //set account anme
                                receivable.accountName = getReceivableAccountName(receivable.type);
                                var uiidData = IdentityService.getUUIDData(receivable.documentId);
                                receivable.document = uiidData.typeId === 1 ? 'Conta a Receber' : 'Pedido';
                                receivable.uuidCode = $filter('uuidCode')(receivable, 'documentId');

                                receivable.installments = ReceivableService.listByDocument(receivable.documentId);
                                receivable.installments = filterByCanceled(receivable.installments);
                                receivable.numberOfInstallment = receivable.installments.length;

                                receivable.installments = $filter('orderBy')(receivable.installments, 'duedate');
                                for ( var y in receivable.installments) {
                                    if (receivable.installments[y].uuid === receivable.uuid) {
                                        // set actual installment
                                        receivable.installment = Number(y) + 1;
                                    }
                                }
                                receivable.installments = filterByLiquidated(receivable.installments);

                            } else {
                                // Receivables coming from warmup.
                                receivable.document = 'Conta a Receber';
                                // FIXME OnCuff receivables seem to store the installment in the number
                                // property. Need to check if this is really the case.
                                if(receivable.payment.type==='check'){
                                    var installments = receivable.payment.installments;
                                    var numberOfInstallments = receivable.payment.numberOfInstallments;
                                    
                                    receivable.installment = installments ? installments : 1;
                                    receivable.numberOfInstallment = numberOfInstallments ? numberOfInstallments : 1;
                                }else{
                                    var installments = receivable.payment.installments || receivable.payment.number;
                                    var numberOfInstallments = receivable.payment.numberOfInstallments;
                                    
                                    receivable.installment = installments ? installments : 1;
                                    receivable.numberOfInstallment = numberOfInstallments ? numberOfInstallments : 1;
                                }                                
                            }

                            receivable.status = (receivable.liquidated === undefined) ? 'A Receber' : 'Recebido';
                        }
                        return receivables;
                    }
                    
                    function getNetAmountForCreditCardWithGateway(receivable){
                        var installments = receivable.payment.installments;
                        
                        return FinancialMathService.presentValue(PP_FIXED_RATIO, PP_MONTHLY_RATIO, installments, receivable.amount);

                    }

                    function getNetAmountForCreditCardWithoutGateway(receivable){
                        if(receivable.payment && receivable.payment.creditcardTax && receivable.payment.creditcardTax > 0) {
                            return FinancialMathService.currencyPercentageSubtract(receivable.amount, receivable.payment.creditcardTax);                                
                        }
                        return receivable.amount;
                    }
                    
                    //FIXME we can't read the account name from 
                    //bookService cause there's no book inserted.
                    //for now the access name is hardcoded.
                    function getReceivableAccountName(type){
                        var accountName = undefined;
                        
                        if(type ==='cash'){
                            accountName = 'Recebimento em dinheiro';
                        }else if(type ==='check'){
                            accountName = 'Cheques a receber'; 
                        }else if(type === 'onCuff'){
                            accountName = 'Contas a receber diversas';
                        }else if(type === 'creditCard'){
                            accountName = 'Cartões a receber';
                        }
                        return accountName;
                        
                        /*if(type ==='check'){
                            var book = $filter('filter')(BookService.list(), function(book){
                                return book.access === "11121";
                            });
                            accountName = book[0].name; 
                        }else if(type === 'onCuff'){
                            var book = $filter('filter')(BookService.list(), function(book){
                                return book.access === "11511";
                            });
                            accountName = book[0].name;
                        }else if(type === 'creditCard'){
                            var book = $filter('filter')(BookService.list(), function(book){
                                return book.access === "11512";
                            });
                            accountName = book[0].name;
                        }else{
                            console.log('Huston we have a problem');
                        }
                        return accountName;*/
                    }
                    // #########################################
                    // TO REMEMBER DATE BEFORE CLICK CHECK BOX
                    // ##########################################
                    var lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
                    function removeDtInitial() {
                        if ($scope.allOpenReceivables === 'true') {
                            if ($scope.dtFilter.dtInitial) {
                                lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
                            }
                            $scope.selectReceivableMode('listOpen');
                            $scope.dtFilter.dtInitial = undefined;
                            $scope.dtIniDisabled = true;
                        } else {
                            $scope.dtIniDisabled = false;
                            $scope.dtFilter.dtInitial = angular.copy(lastFilterDate);
                        }
                    }

                    $scope.allOpenReceivables = 'true';
                    $scope.selectReceivableMode('listOpen');

                    // ##############################
                    // WATCHERS
                    // ###############################
                    $scope.$watchCollection('dtFilter', ensureDateOrder);
                    $scope.$watchCollection('dtFilter', filterReceivables);
                    $scope.$watch('selectedReceivableMode', filterReceivables);
                    $scope.$watch('selectedReceivable', filterReceivables);
                    $scope.$watch('allOpenReceivables', removeDtInitial);

                    // expose functions for tests
                    this.filterReceivablesByDate = filterReceivablesByDate;
                    this.filterByDate = filterByDate;
                    this.ensureDateOrder = ensureDateOrder;

                }
            ]);
})(angular);
