(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.payment.check',
            [
                'tnt.catalog.filter.findBy', 'tnt.catalog.payment.entity', 'tnt.utils.array', 'tnt.catalog.misplaced.service',
                'tnt.catalog.payment.service'
            ]).controller(
            'PaymentCheckCtrl',
            function($scope, $filter, $log, $element, CheckPayment, OrderService, ArrayUtils, Misplacedservice, PaymentService) {

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

                    if (isDuplicated(check)) {
                        // check if is duplicated.
                        dialogService.messageDialog({
                            title : 'Pagamento com Cheque',
                            message : 'O cheque número ' + check.number + ' já foi adicionado',
                            btnYes : 'OK'
                        });
                        return;
                    }

                    if (check.id) {
                        // if is an update
                        var id = check.id;

                        var editCheck = $filter('findBy')($scope.payments, 'id', id);
                        editCheck.bank = check.bank;
                        editCheck.agency = check.agency;
                        editCheck.account = check.account;
                        editCheck.duedate = check.duedate;
                        editCheck.amount = check.amount;

                        Misplacedservice.recalc(checkSum, $scope.payments.indexOf(editCheck), $scope.payments, 'amount');
                    } else {
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
                    }
                    angular.extend(check, emptyCheckTemplate);
                    $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
                };

                $scope.edit = function edit(payment) {
                    check.id = payment.id;
                    check.amount = payment.amount;
                    check.duedate = payment.duedate;
                    check.number = payment.number;
                    check.bank = payment.bank;
                    check.agency = payment.agency;
                    check.account = payment.account;
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
                    var installmentsNumber = newCheck.installments;
                    delete newCheck.installments;

                    var installmentsSum = 0;
                    for ( var i = 0; i < installmentsNumber; i++) {
                        // make a copy
                        var checkInstallment = angular.copy(newCheck);

                        checkInstallment.number = '' + (Number(newCheck.number) + i);

                        checkInstallment.duedate = properDate(checkInstallment.duedate, i);

                        checkInstallment.amount = 0;

                        installmentsSum = Math.round((installmentsSum + checkInstallment.amount) * 100) / 100;
                        newChecks.push(checkInstallment);
                    }

                    var total = checkSum - $filter('sum')($scope.payments, 'amount');
                    newChecks[0].amount = check.amount;
                    Misplacedservice.recalc(total, 0, newChecks, 'amount');

                    if ((installmentsSum + sumChecks()) !== checkSum) {
                        $log.info('PaymentCheckCtrl.buildInstallments: -The sum of the installments and the amount are' +
                            ' different, installmentsSum=' + (installmentsSum + sumChecks()) + ' originalAmount=' + checkSum);
                    }
                    return newChecks;
                }
                //                
                // function recalcChecks(id){
                // var copyPayments = angular.copy($scope.payments);
                // var sumRemaining = 0;
                // var remainingInstallments = 0;
                // for(var x = id;x++;x<copyPayments.length){
                // sumRemaining+=copyPayments[x].amount;
                // remainingInstallments++;
                // }
                //                    
                // }

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
                        $scope.payments.push(newChecks[ix]);
                    }
                    // $scope.payments = newChecks;
                }
                /**
                 * Check if the new check is already added into another payment.
                 * 
                 * @param newCheck - the object containing the newCheck data.
                 */
                function isDuplicated(newCheck) {
                    var checks = $filter('filter')($scope.payments, function(item) {
                        var result = false;
                        result = item.bank === newCheck.bank;
                        result = result && (item.agency === newCheck.agency);
                        result = result && (item.account === newCheck.account);
                        result = result && (Number(item.number) >= Number(newCheck.number));
                        result = result && (Number(item.number) <= ((Number(newCheck.number) + Number(newCheck.installments)) - 1));
                        if (newCheck.id) {
                            // isn't
                            // duplicated,
                            // is an update
                            result = result && (item.id !== newCheck.id);
                        }
                        return result;
                    });
                    return checks.length > 0;
                }
            });
}(angular));
