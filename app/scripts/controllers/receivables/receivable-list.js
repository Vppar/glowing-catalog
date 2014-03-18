(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.list.ctrl', [])
        .controller(
            'ReceivableListCtrl',
            [
                '$log',
                '$scope',
                '$filter',
                'ReceivableService',
                'EntityService',
                'OrderService',
                function ($log, $scope, $filter, ReceivableService, EntityService, OrderService) {

                    function setTime (date, hours, minutes, seconds, milliseconds) {
                        date.setHours(hours);
                        date.setMinutes(minutes);
                        date.setSeconds(seconds);
                        date.setMilliseconds(milliseconds);
                        return date;
                    }
                    
                    //############################
                    //TRASNLATOR TABAJARA
                    //############################
                    var translate = {};
                    translate.cash = 'Dinheiro';
                    translate.onCuff = 'A Receber';
                    translate.check = 'Cheque';
                    translate.voucher = 'Voucher';
                    translate.gift = 'Vale Presente';
                    translate.exchange = 'Troca de Produto';
                    translate.coupon = 'Cupom';
                    translate.noMerchantCc = 'Cartão de Crédito';
                    translate.creditCard = 'Cartão de Crédito';

                    //################
                    //FILTERS RELATED
                    //###############
                    function filterByDate (receivable) {
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
                            if (receivable.duedate >= initialFilter &&
                                receivable.duedate <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else if (initialFilter) {
                            if (receivable.duedate >= initialFilter) {
                                return true;
                            }
                            return false;
                        } else if (finalFilter) {
                            if (receivable.duedate <= finalFilter) {
                                return true;
                            }
                            return false;
                        } else {
                            return true;
                        }
                    }

                    function receivableCanceledFilter (receivable) {
                        var result = (receivable.canceled === undefined);
                        return result;
                    }

                    function receivableLiquidatedFilter (receivable) {
                        var result = (receivable.liquidated === undefined);
                        return result;
                    }

                    function filterReceivablesByDate (receivables) {
                        return $filter('filter')(receivables, filterByDate);
                    }

                    function filterByCanceled (receivables) {
                        return $filter('filter')(receivables, receivableCanceledFilter);
                    }

                    function filterByLiquidated (receivables) {
                        return $filter('filter')(receivables, receivableLiquidatedFilter);
                    }
                    
                    function filterReceivables () {
                        var receivables = ReceivableService.listActive();

                        receivables = filterReceivablesByDate(receivables);
                        receivables = argumentReceivables(receivables);

                        if ($scope.selectedReceivableMode === 'listOpen') {
                            receivables = filterReceivablesByLiquidated(receivables);
                        }

                        $scope.receivables.list = $filter('orderBy')(receivables, 'duedate');
                    }

                    function filterReceivablesByLiquidated (receivables) {
                        return $filter('filter')(receivables, receivableLiquidateFilter);
                    }

                    function receivableLiquidateFilter (receivable) {
                        return (receivable.liquidated === undefined);
                    }
                    
                    function ensureDateOrder () {
                        if ($scope.dtFilter.dtInitial > $scope.dtFilter.dtFinal) {
                            var initial = $scope.dtFilter.dtInitial, final =
                                $scope.dtFilter.dtFinal;

                            $scope.dtFilter.dtInitial = final;
                            $scope.dtFilter.dtFinal = initial;
                        }
                    }
                    //#############################
                    //ARGUMENT RECEIVABLES
                    //#############################                    
                    function argumentReceivables (receivables) {
                        for ( var ix in receivables) {
                            var receivable = receivables[ix];
                            receivable.entityName = EntityService.read(receivable.entityId).name;
                            receivable.classification = translate[receivable.type];
                            receivable.documentType = 'Pedido';

                            receivable.status =
                                (receivable.liquidated === undefined) ? 'Aberta' : 'Pago';
                            receivable.installments =
                                ReceivableService.listByDocument(receivable.documentId);
                            receivable.installments = filterByCanceled(receivable.installments);
                            receivable.numberOfInstallment = receivable.installments.length;

                            receivable.installments =
                                $filter('orderBy')(receivable.installments, 'duedate');
                            for ( var y in receivable.installments) {
                                if (receivable.installments[y].uuid === receivable.uuid) {
                                    // set actual installment
                                    receivable.installment = Number(y) + 1;
                                }
                            }
                            receivable.installments = filterByLiquidated(receivable.installments);

                            receivable.order = OrderService.read(receivable.documentId);
                            receivable.order.uiidCode = $filter('uuidCode')(receivable.order);

                            // FIXME document type hard coded.
                            receivable.order.document = 'Venda de Produtos';
                        }
                        return receivables;
                    }
                    //#########################################
                    //TO REMEMBER DATE BEFORE CLICK CHECK BOX
                    //##########################################
                    var lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
                    function removeDtInitial () {
                        if ($scope.allOpenReceivables === 'true') {
                            if ($scope.dtFilter.dtInitial) {
                                lastFilterDate = angular.copy($scope.dtFilter.dtInitial);
                            }
                            $scope.selectReceivableMode('listOpen');
                            $scope.dtFilter.dtInitial = undefined;
                            $scope.dtIniDisabled = true;
                        } else {
                            $scope.dtIniDisabled = false;
                            $scope.selectReceivableMode('listAll');
                            $scope.dtFilter.dtInitial = angular.copy(lastFilterDate);
                        }
                    }
                    
                    //##############################
                    //WATCHERS 
                    //###############################
                    $scope.$watchCollection('dtFilter', ensureDateOrder);
                    $scope.$watchCollection('dtFilter', filterReceivables);
                    $scope.$watch('selectedReceivableMode', filterReceivables);
                    $scope.$watch('selectedReceivable', filterReceivables);
                    $scope.$watch('allOpenReceivables', removeDtInitial);
                    
                    //expose functions for tests 
                    this.filterReceivablesByDate = filterReceivablesByDate;
                    this.filterByDate = filterByDate;
                    this.ensureDateOrder = ensureDateOrder;

                }
            ]);
}(angular));