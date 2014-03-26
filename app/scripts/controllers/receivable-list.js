(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.list.ctrl', []).controller(
            'ReceivableListCtrl',
            ['$log', '$scope', '$filter', 'ReceivableService', 'EntityService', 'OrderService',
            function($log, $scope, $filter, ReceivableService, EntityService, OrderService) {
                function setTime(date, hours, minutes, seconds, milliseconds) {
                    date.setHours(hours);
                    date.setMinutes(minutes);
                    date.setSeconds(seconds);
                    date.setMilliseconds(milliseconds);
                    return date;
                }
                // FIXME may is't the right information
                var translate = {};
                translate.cash = 'Dinheiro';
                translate.onCuff = 'Fiado';
                translate.check = 'Cheque';
                translate.voucher = 'Voucher';
                translate.gift = 'Vale Presente';
                translate.exchange = 'Troca de Produto';
                translate.coupon = 'Cupom';
                translate.noMerchantCc = 'Cartão de Crédito';
                translate.creditCard = 'Cartão de Crédito';
                $scope.query = '';

                var searchableFields = [
                    'uuid', 'amount', 'type', 'remarks', 'entityName'
                ];

                function receivableQueryFilter(receivable) {
                    var terms = $scope.query.split(' ');
                    var isTermInField;

                    var term, field;
                    // For each term in the query, check if it matches any of
                    // the searchable fields. If not, return false.
                    for ( var idx1 in terms) {
                        term = terms[idx1].toLowerCase();

                        isTermInField = false;

                        for ( var idx2 in searchableFields) {
                            field = searchableFields[idx2];
                            var val = angular.isDefined(receivable[field]) ? '' + receivable[field] : '';
                            val = val.toLowerCase();

                            isTermInField = val && ~val.indexOf(term);

                            // Term matches the curren field! We don't need to
                            // keep looking in the remaining fields.
                            if (isTermInField) {
                                break;
                            }
                        }

                        if (!isTermInField) {
                            return false;
                        }
                    }

                    return true;
                }

                function receivableDateFilter(receivable) {
                    return receivable.duedate >= $scope.dtFilter.dtInitial.getTime() &&
                        receivable.duedate <= $scope.dtFilter.dtFinal.getTime();
                }

                function receivableCanceledFilter(receivable) {
                    var result = (receivable.canceled === undefined);
                    return result;
                }

                function receivableLiquidatedFilter(receivable) {
                    var result = (receivable.liquidated === undefined);
                    return result;
                }

                function filterReceivablesByQuery(receivables) {
                    return $filter('filter')(receivables, receivableQueryFilter);
                }

                function filterReceivablesByDate(receivables) {
                    setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);
                    setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
                    return $filter('filter')(receivables, receivableDateFilter);
                }

                function filterByCanceled(receivables) {
                    return $filter('filter')(receivables, receivableCanceledFilter);
                }

                function filterByLiquidated(receivables) {
                    return $filter('filter')(receivables, receivableLiquidatedFilter);
                }

                function filterReceivables() {
                    var receivables = ReceivableService.listActive();

                    if ($scope.query) {
                        receivables = filterReceivablesByQuery(receivables);
                    }

                    receivables = filterReceivablesByDate(receivables);
                    receivables = argumentReceivables(receivables);

                    $scope.receivables.list = $filter('orderBy')(receivables, 'duedate');
                }

                function ensureDateOrder() {
                    if ($scope.dtFilter.dtInitial > $scope.dtFilter.dtFinal) {
                        var initial = $scope.dtFilter.dtInitial, final = $scope.dtFilter.dtFinal;

                        $scope.dtFilter.dtInitial = final;
                        $scope.dtFilter.dtFinal = initial;
                    }
                }

                function argumentReceivables(receivables) {
                    for ( var ix in receivables) {
                        var receivable = receivables[ix];
                        receivable.entityName = EntityService.read(receivable.entityId).name;
                        receivable.classification = translate[receivable.type];
                        receivable.documentType = 'Pedido';

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

                        receivable.order = OrderService.read(receivable.documentId);
                        receivable.order.uiidCode = $filter('uuidCode')(receivable.order);

                        // FIXME document type hard coded.
                        receivable.order.document = 'Venda de Produtos';
                    }
                    return receivables;
                }

                $scope.$watchCollection('dtFilter', ensureDateOrder);
                $scope.$watchCollection('dtFilter', filterReceivables);
                $scope.$watchCollection('query', filterReceivables);
                this.receivableDateFilter = receivableDateFilter;
                this.receivableQueryFilter = receivableQueryFilter;
            }]);
}(angular));