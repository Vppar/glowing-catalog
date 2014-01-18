(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.payment.check', [
                'tnt.catalog.filter.findBy', 'tnt.catalog.payment.entity'
            ])
            .controller(
                    'PaymentCheckCtrl',
                    function($scope, $element, $filter, $log, PaymentService) {

                        // #####################################################################################################
                        // Warm up the controller
                        // #####################################################################################################

                        // Initialize the check field with a empty check and
                        // bind it to the
                        // scope
                        var parent = $scope.$parent;
                        while (parent && !parent.hasOwnProperty('payment')) {
                            parent = parent.$parent;
                        }
                        parent.check = {};

                        var check = $scope.check;
                        var emptyCheckTemplate = {
                            installments : 1,
                            bank : null,
                            agency : null,
                            account : null,
                            number : null,
                            duedate : null,
                            amount : 0
                        };
                        angular.extend(check, emptyCheckTemplate);

                        // Find the id of check payment type
                        // var checkTypeId =
                        // $scope.findPaymentTypeByDescription('check').id;

                        // Recovering dialogService from parent scope.
                        var dialogService = $scope.dialogService;

                        // #####################################################################################################
                        // Scope action functions
                        // #####################################################################################################

                        /**
                         * Verifies if entered check already exists in the
                         * $scope.payments array and if not, adds check to the
                         * last position.
                         * 
                         * @param newCheck - the object containing the newCheck
                         *            data.
                         */
                        parent.addCheck = function addCheck(newCheck) {
                            // check if the all mandatory fields are filed.
                            if ($scope.checkForm.$valid) {
                                if (!newCheck.amount || newCheck.amount === 0) {
                                    return;
                                }
                                if (isDuplicated(newCheck)) {
                                    // check if is duplicated.
                                    dialogService.messageDialog({
                                        title : 'Pagamento com Cheque',
                                        message : 'Não é possível inserir um cheque que já existe na lista.',
                                        btnYes : 'OK'
                                    });
                                    return;
                                }

                                if (newCheck.id) {
                                    // if is an update
                                    var id = newCheck.id;
                                    var amount = newCheck.amount;

                                    delete newCheck.id;
                                    delete newCheck.amount;

                                    var payment = $filter('findBy')($scope.payments, 'id', id);
                                    payment.data = angular.copy(newCheck);
                                    payment.amount = amount;
                                } else {
                                    var newChecks = null;
                                    // Will be payed by installments ?
                                    if (newCheck.installments > 1) {
                                        newChecks = buildInstallments(newCheck);
                                    } else {
                                        newChecks = [
                                            newCheck
                                        ];
                                    }
                                    createPayments(newChecks);
                                    rebuildInstallmentIds();
                                }
                                angular.extend(newCheck, emptyCheckTemplate);
                                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
                            }
                        };

                        $scope.edit = function edit(payment) {
                            angular.extend(check, payment.data);
                            check.id = payment.id;
                            check.amount = payment.amount;
                        };

                        /**
                         * Clear all check fields
                         */
                        $scope.clearCheck = function clearCheck() {
                            angular.extend(check, emptyCheckTemplate);
                            $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
                        };

                        /**
                         * Removes selected check from $scope.payments array
                         * 
                         * @param payment - check payment to be removed.
                         */
                        $scope.removeCheck = function removeCheck(payment) {
                            // Show dialog to confirm exclusion
                            dialogService.messageDialog({
                                title : 'Pagamento Com Cheque',
                                message : 'Confirmar exclusão da parcela?',
                                btnYes : 'Sim',
                                btnNo : 'Não'
                            }).then(function() {
                                var paymentIdx = $scope.payments.indexOf(payment);
                                $scope.payments.splice(paymentIdx, 1);
                                rebuildInstallmentIds();
                                $scope.clearCheck();
                                delete check.id;
                            });
                            ;

                        };

                        function rebuildInstallmentIds() {
                            var checkPayments = $filter('paymentType')($scope.payments, 'check');
                            for ( var idx in checkPayments) {
                                checkPayments[idx].data.installmentId = Number(idx) + 1;
                            }
                        }

                        // #####################################################################################################
                        // Auxiliary functions
                        // #####################################################################################################

                        function buildInstallments(newCheck) {
                            var newChecks = [];
                            // Well the payment will be by installments, so
                            // store
                            // calc the installments amount.
                            var installmentsAmount = Math.round(newCheck.amount * 100 / newCheck.installments) / 100;
                            // save the installments number so we can delete it
                            var installmentsNumber = newCheck.installments;
                            delete newCheck.installments;

                            var installmentsSum = 0;
                            for ( var i = 0; i < installmentsNumber; i++) {
                                // make a copy
                                var checkInstallment = angular.copy(newCheck);

                                checkInstallment.number = '' + (Number(newCheck.number) + i);
                                checkInstallment.duedate.setMonth(checkInstallment.duedate.getMonth() + i);

                                if (Number(installmentsNumber) === i + 1) {
                                    var finalAmount = newCheck.amount - installmentsSum;
                                    finalAmount = Math.round(finalAmount * 100) / 100;
                                    checkInstallment.amount = finalAmount;
                                } else {
                                    checkInstallment.amount = installmentsAmount;
                                }
                                installmentsSum = Math.round((installmentsSum + checkInstallment.amount) * 100) / 100;
                                newChecks.push(checkInstallment);
                            }
                            if (installmentsSum !== newCheck.amount) {
                                $log.info('PaymentCheckCtrl.buildInstallments: -The sum of the installments and the amount are' +
                                    ' different, installmentsSum=' + installmentsSum + ' originalAmount=' + newCheck.amount);
                            }
                            return newChecks;
                        }

                        function createPayments(newChecks) {
                            for ( var idx in newChecks) {
                                // var newCheck = newChecks[idx];
                                // var payment =
                                // PaymentService.createNew('check');
                                //
                                // var amount = newCheck.amount;
                                // delete newCheck.amount;
                                //
                                // payment.amount = amount;
                                // payment.data = angular.copy(newCheck);
                            }
                        }
                        /**
                         * Check if the new check is already added into another
                         * payment.
                         * 
                         * @param newCheck - the object containing the newCheck
                         *            data.
                         */
                        function isDuplicated(newCheck) {
                            var checks =
                                    $filter('filter')
                                            (
                                                    $scope.payments,
                                                    function(item) {
                                                        var result = false;
                                                        if (item.typeId === checkTypeId) {
                                                            // Done this way
                                                            // cause when
                                                            // everything is
                                                            // placed in one row
                                                            // the code became
                                                            // damn ugly.
                                                            result = item.data.bank === newCheck.bank;
                                                            result = result && (item.data.agency === newCheck.agency);
                                                            result = result && (item.data.account === newCheck.account);
                                                            result = result && (Number(item.data.number) >= Number(newCheck.number));
                                                            result =
                                                                    result &&
                                                                        (Number(item.data.number) <= ((Number(newCheck.number) + Number(newCheck.installments)) - 1));
                                                            if (newCheck.id) {
                                                                // isn't
                                                                // duplicated,
                                                                // is an update
                                                                result = result && (item.id !== newCheck.id);
                                                            }
                                                        }
                                                        return result;
                                                    });
                            return checks.length > 0;
                        }
                    });
}(angular));
