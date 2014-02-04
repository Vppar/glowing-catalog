(function(angular) {
    'use strict';
    angular.module(
            'tnt.catalog.receivable.add.ctrl',
            [
                'tnt.catalog.receivable.entity', 'tnt.catalog.coin.entity', 'tnt.catalog.misplaced.service', 'tnt.catalog.entity.service',
                'tnt.catalog.type'
            ]).controller(
            'ReceivableAddCtrl',
            function($scope, ReceivableService, Receivable, Misplacedservice, EntityService, TypeKeeper) {

                var mReceivable = '';

                // #############################################################################################################
                // Scope variables
                // #############################################################################################################

                $scope.receivable = {};
                $scope.receivable.created = new Date();
                $scope.installments = [];
                $scope.customers = EntityService.list();
                $scope.installmentsExist = false;

                $scope.documents = TypeKeeper.list('document');
                
                $scope.documents = TypeKeeper.list('');
                
                
                /**
                 * Check if there's any installment to control the Confirm
                 * button
                 */
                $scope.$watchCollection('installments', function() {
                    if ($scope.installments.length !== 0) {
                        $scope.installmentsExist = true;
                    } else {
                        $scope.installmentsExist = false;
                    }
                });

                /**
                 * Confirm the Receivables
                 */
                $scope.createReceivable = function createReceivable() {
                    for ( var i in $scope.installments) {
                        ReceivableService.register($scope.installments[i]);
                    }
                    $scope.installments.splice(0, $scope.installments.length);
                };

                /**
                 * Create the installments
                 */
                $scope.createInstallments =
                        function createInstallments() {

                            $scope.installments.splice(0, $scope.installments.length);

                            var installments = [];
                            for ( var ix = 0; ix < $scope.receivable.installments; ix++) {
                                installments.push({
                                    amount : 0
                                });
                            }
                            Misplacedservice.recalc($scope.receivable.amount, -1, installments, 'amount');
                            
                            for ( var idx in installments) {
                                var copyDate = angular.copy($scope.receivable.duedate);

                                mReceivable =
                                        new Receivable(null, new Date(), $scope.customerId, installments[idx].amount, properDate(
                                                copyDate, idx));

                                mReceivable.document = $scope.receivable.document;
                                mReceivable.type = $scope.receivable.type;
                                mReceivable.remarks = $scope.receivable.remarks;

                                $scope.installments.push(mReceivable);
                            }
                        };

                // #############################################################################################################
                // Help functions
                // #############################################################################################################

                /**
                 * Create the date for further installments
                 */
                function properDate(baseDate, increase) {
                    var date = new Date(baseDate.getYear(), baseDate.getMonth() + 1 + increase, 0);
                    if (baseDate.getDate() > date.getDate()) {
                        return date;
                    } else {
                        return baseDate.setMonth(baseDate.getMonth() + increase);
                    }
                }
            });
}(angular));