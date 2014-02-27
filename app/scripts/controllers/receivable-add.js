(function(angular) {
    'use strict';
    angular.module(
            'tnt.catalog.financial.receivable.add.ctrl',
            [
                'tnt.catalog.receivable.entity', 'tnt.catalog.coin.entity', 'tnt.catalog.misplaced.service', 'tnt.catalog.entity.service',
                'tnt.catalog.type'
            ]).controller(
            'ReceivableAddCtrl',
            function($scope, $q, ReceivableService, Receivable, Misplacedservice, EntityService, TypeKeeper) {

                var mReceivable = '';

                // #############################################################################################################
                // Scope variables
                // #############################################################################################################

                $scope.emptyReceivable = {
                    created : new Date(),
                    installments : 1,
                    duedate : new Date(),
                    amount : 0
                };
                $scope.dateMin = new Date();
                $scope.receivable = angular.copy($scope.emptyReceivable);
                $scope.installments = [];
                $scope.installmentsCopy = [];
                $scope.customers = EntityService.list();
                $scope.installmentsExist = false;
                $scope.validForm = false;
                $scope.receivables = {};
                $scope.receivables.list = ReceivableService.list();

                $scope.documents = TypeKeeper.list('document');
                $scope.classification = TypeKeeper.list('classification');

                // #############################################################################################################
                // Scope functions
                // #############################################################################################################

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
                 * Check if the form was filled properly.
                 */
                $scope.$watchCollection('receivable', function() {

                    if (($scope.receivable.installments === 0 || $scope.receivable.installments === '') ||
                        ($scope.receivable.amount === 0 || $scope.receivable.amount === '') ||
                        ($scope.receivable.customerId === undefined || $scope.receivable.customerId === '') ||
                        ($scope.receivable.documentNumber === undefined || $scope.receivable.documentNumber === '') ||
                        ($scope.receivable.documentId === undefined || $scope.receivable.documentId === '') ||
                        ($scope.receivable.duedate === null || $scope.receivable.duedate === '') ||
                        ($scope.receivable.created === null || $scope.receivable.created === '')) {
                        $scope.validForm = false;
                    } else {
                        $scope.validForm = true;
                    }
                });

                /**
                 * Confirm the Receivables
                 */
                $scope.createReceivables = function createReceivables() {
                    var promises = [];
                    for ( var i in $scope.installments) {
                        var promise = ReceivableService.register($scope.installments[i]);
                        promises.push(promise);
                    }
                    $q.all(promises).then(function() {
                        $scope.cancelReceivable();
                    });
                };

                $scope.cancelReceivable = function() {
                    $scope.installmentsCopy.splice(0, $scope.installmentsCopy.length);
                    $scope.installments.splice(0, $scope.installments.length);
                    $scope.receivables.list = ReceivableService.list();
                    $scope.receivable = angular.copy($scope.emptyReceivable);
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
                                        new Receivable(
                                                null, new Date(), $scope.receivable.customerId, installments[idx].amount, properDate(
                                                        copyDate, idx));

                                mReceivable.documentId = $scope.receivable.documentId;
                                mReceivable.type = $scope.receivable.type;
                                mReceivable.document = $scope.receivable.documentNumber;
                                mReceivable.remarks = $scope.receivable.remarks;

                                $scope.installments.push(mReceivable);
                            }
                            $scope.installmentsCopy = angular.copy($scope.installments);
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
                        return baseDate.setMonth((parseInt(baseDate.getMonth(), 10) + parseInt(increase, 10)));
                    }
                }
            });
}(angular));