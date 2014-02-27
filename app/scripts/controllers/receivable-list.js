(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.list.ctrl', []).controller(
            'ReceivableListCtrl',
            function($log, $scope, $filter, ReceivableService, EntityService, OrderService, ArrayUtils) {
                
                var filterCancel = true;
                
                function setTime(date, hours, minutes, seconds, milliseconds) {
                    date.setHours(hours);
                    date.setMinutes(minutes);
                    date.setSeconds(seconds);
                    date.setMilliseconds(milliseconds);
                }
                //FIXME may is't the right information
                var translate = {};
                translate["cash"] = "Dinheiro";
                translate["onCuff"] = "Pendurado";
                translate["check"] = "Cheque";
                translate["voucher"] = "Voucher";
                translate["gift"] = "Vale Presente";
                translate["exchange"] = "Troca de Produto";
                translate["coupon"] = "Cupom";
                translate["noMerchantCc"] = "No Merchant CC";
                translate["creditCard"] = "Cartão de Crédito";

                $scope.query = '';
                
                $scope.dtFilter = {
                    dtInitial : new Date(),
                    dtFinal : new Date()
                };

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
                
                function receivablePendingFilter(receivable) {
                    var result = (receivable.canceled === undefined ) && (receivable.liquidated === undefined);  
                    return result;
                }
                function filterReceivablesByQuery() {
                    $scope.receivables.list = $filter('filter')($scope.receivables.list, receivableQueryFilter);
                }

                function filterReceivablesByDate() {
                    setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);
                    setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
                    $scope.receivables.list = $filter('filter')($scope.receivables.list, receivableDateFilter);
                }
                
                function filterByPending(receivables) {
                    return $filter('filter')(receivables, receivablePendingFilter);
                }
                

                function filterReceivables() {
                    $scope.receivables.list = ReceivableService.listActive();

                    filterReceivablesByDate();
                    
                    argumentReceivables($scope.receivables.list);
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

                        receivable.installments = ReceivableService.listByDocument(receivable.documentId,filterCancel);
                        
                        for ( var y in receivable.installments) {
                            if (receivable.installments[y].uuid === receivable.uuid) {
                                // set actual installment
                                receivable.installment = Number(y) + 1;
                            }
                        }
                        
                        receivable.installments = filterByPending(receivable.installments);
                        
                        receivable.order = OrderService.read(receivable.documentId);
                        receivable.order.uiidCode = $filter('uuidCode')(receivable.order);
                        
                        //FIXME document type hard coded. 
                        receivable.order.document = 'Venda de Produtos';
                    }
                }

                $scope.$watchCollection('dtFilter', ensureDateOrder);
                $scope.$watchCollection('dtFilter', filterReceivables);

                this.receivableDateFilter = receivableDateFilter;
                this.receivableQueryFilter = receivableQueryFilter;
            });
}(angular));
