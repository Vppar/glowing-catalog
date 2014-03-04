(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.payment.check',
            [
                'tnt.catalog.filter.findBy', 'tnt.catalog.payment.entity', 'tnt.utils.array', 'tnt.catalog.misplaced.service',
                'tnt.catalog.payment.service'
            ]).controller(
            'PaymentCheckCtrl',
            function($q, $scope, $filter, $log, $element, CheckPayment, OrderService, ArrayUtils, Misplacedservice, PaymentService) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################

                $scope.dateMin = new Date();

                var check = $scope.check = {};
                var copyPayments = [];
                var checkSum = 0;

                $scope.payments = PaymentService.list('check');
                checkSum = (-1) * $scope.total.change + $filter('sum')(PaymentService.list('check'), 'amount');

                var emptyCheckTemplate = {
                    installments : 1,
                    bank : null,
                    agency : null,
                    account : null,
                    number : null,
                    duedate : new Date(),
                    amount : 0
                };
                angular.extend(check, emptyCheckTemplate);

                // Recovering dialogService from parent scope.
                var dialogService = $scope.dialogService;

                // #####################################################################################################
                // Scope action functions
                // #####################################################################################################

                /**
                 * Verifies if entered check already exists in the
                 * $scope.payments array and if not, adds check to the last
                 * position.
                 * 
                 * @param newCheck - the object containing the newCheck data.
                 */

                $scope.addCheck = function addCheck() {
                    // check if the all mandatory fields are filed.
                    if (!$scope.checkForm.$valid) {
                        // TODO Log!
                        return;
                    }

                    if (!check.amount || check.amount === 0) {
                        return;
                    }

                    // isDuplicated(check);
                    if (isDuplicated(check)) {
                        // check if is duplicated.
                        dialogService.messageDialog({
                            title : 'Pagamento com Cheque',
                            message : 'O cheque número ' + check.number + ' já foi adicionado',
                            btnYes : 'OK'
                        });
                        return;
                    }

                    var newChecks = null;
                    // Will be payed by installments ?
                    if (check.installments > 1) {
                        newChecks = buildInstallments(check);
                    } else {
                        var newCheckCopy = angular.copy(check);
                        newChecks = [
                            newCheckCopy
                        ];
                    }
                    createPayments(newChecks);
                    angular.extend(check, emptyCheckTemplate);
                    $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
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
                    }).then(function(result) {
                        if (!result) {
                            return $q.reject();
                        }
                        var paymentIdx = $scope.payments.indexOf(payment);
                        $scope.payments.splice(paymentIdx, 1);
                        rebuildInstallmentIds();
                        $scope.clearCheck();
                        delete check.id;
                        if (checkSum > 0) {
                            Misplacedservice.recalc(checkSum, paymentIdx - 1, $scope.payments, 'amount');
                        }
                    });
                };

                $scope.confirmCheckPayments = function confirmCheckPayments() {
                    console.log($scope.payments);
                    for ( var i in $scope.payments) {
                        if (isDuplicated($scope.payments[i])) {
                            // check if is duplicated.
                            dialogService.messageDialog({
                                title : 'Pagamento com Cheque',
                                message : 'Cheque de número ' + $scope.payments[i].number + ' precisa ser único.',
                                btnYes : 'OK'
                            });
                            return;
                        }
                    }

                    PaymentService.clear('check');
                    for ( var ix in $scope.payments) {
                        var data = $scope.payments[ix];
                        var payment = new CheckPayment(data.amount, data.bank, data.agency, data.account, data.number, data.duedate);
                        payment.amount = data.amount;
                        PaymentService.add(payment);
                    }
                    $scope.selectPaymentMethod('none');
                };

                function rebuildInstallmentIds() {
                    var checkPayments = $filter('paymentType')($scope.payments, 'check');
                    for ( var idx in checkPayments) {
                        checkPayments[idx].id = Number(idx) + 1;
                    }
                }

                // #####################################################################################################
                // Auxiliary functions
                // #####################################################################################################

                function buildInstallments(newCheck) {
                    var newChecks = [];
                    // Well the payment will be by installments, so
                    // store
                    // save the installments number so we can delete it
                    var installmentsAmount = Math.round(100 *(Number(newCheck.amount)/Number(newCheck.installments))) /100;
                    for ( var i = 0; i < newCheck.installments; i++) {
                        // make a copy
                        var checkInstallment = angular.copy(newCheck);

                        checkInstallment.number = '' + (Number(newCheck.number) + i);

                        checkInstallment.duedate = properDate(checkInstallment.duedate, i);

                        if(i===(newCheck.installments-1)){
                            checkInstallment.amount = (newCheck.amount)-(installmentsAmount*(newCheck.installments-1));
                        }else{
                            checkInstallment.amount = installmentsAmount;
                        }

                        newChecks.push(checkInstallment);
                    }

//                    if ((installmentsSum + sumChecks()) !== checkSum) {
//                        $log.info('PaymentCheckCtrl.buildInstallments: -The sum of the installments and the amount are' +
//                            ' different, installmentsSum=' + (installmentsSum + sumChecks()) + ' originalAmount=' + checkSum);
//                    }
                    return newChecks;
                }

                function sumChecks() {
                    copyPayments = angular.copy($scope.payments);
                    var sumChecks = 0;
                    for ( var x in copyPayments) {
                        sumChecks += copyPayments[x].amount;
                    }
                    return sumChecks;
                }

                function properDate(baseDate, increase) {
                    var date = new Date(baseDate.getYear(), baseDate.getMonth() + 1 + increase, 0);

                    if (baseDate.getDate() > date.getDate()) {
                        return date;
                    } else {
                        return baseDate.setMonth(baseDate.getMonth() + increase);
                    }
                }

                function createPayments(newChecks) {
                    for ( var ix in newChecks) {
                        newChecks[ix].id = $scope.payments.length + 1;
                        console.log(newChecks[ix]);
                        $scope.payments.push(newChecks[ix]);
                    }
                }
                /**
                 * Check if the new check is already added into another payment.
                 * 
                 * @param newCheck - the object containing the newCheck data.
                 */
                function isDuplicated(newCheck) {

                    var result = ArrayUtils.list($scope.payments, 'bank', newCheck.bank);
                    result = ArrayUtils.list(result, 'agency', newCheck.agency);
                    result = ArrayUtils.list(result, 'account', newCheck.account);
                    result = ArrayUtils.list(result, 'number', newCheck.number);

                    if (result.length > 1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            });
}(angular));
