(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.payment.check', [
                'tnt.catalog.filter.findBy', 'tnt.catalog.payment.entity', 'tnt.utils.array'
            ])
            .controller(
                    'PaymentCheckCtrl',
                    function($scope, $element, $filter, $log, CheckPayment, OrderService, ArrayUtils) {

                        // #####################################################################################################
                        // Warm up the controller
                        // #####################################################################################################

                        $scope.subtotals = $filter('sum')(OrderService.order.items, 'price', 'qty');
                        $scope.dateMin = new Date();
                        
                        var check = $scope.check = {};
                        $scope.payments = [];
//                        amount, bank, agency, account, check, dueDate
//                        var emptyCheckTemplate = new CheckPayment (0, null, null, null, null, null);
//                        emptyCheckTemplate.installments = 1;
                        
                        var emptyCheckTemplate = {
                            installments : 1,
                            bank : null,
                            agency : null,
                            account : null,
                            number : null,
                            duedate :  new Date(),
                            amount : 0
                        };
                        angular.extend(check, emptyCheckTemplate);
                        
                        // Find the id of check payment type
                         var checkTypeId = $scope.check.id;

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
                        
                        $scope.addCheck = function addCheck(newCheck) {
                            // check if the all mandatory fields are filed.
                            if ($scope.checkForm.$valid) {
                                if($scope.subtotals === 0){
                                    dialogService.messageDialog({
                                        title : 'Pagamento com Cheque',
                                        message : 'Não é possível criar um pagamento enquanto o subtotal for R$ 0,00.',
                                        btnYes : 'OK'
                                    });
                                    return;
                                }
                                
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

                                    delete newCheck.id;
                                    var editCheck = $filter('findBy')($scope.payments, 'id', id);
                                    editCheck.bank = check.bank;
                                    editCheck.agency = check.agency;
                                    editCheck.account = check.account;
                                    editCheck.duedate = check.duedate;
                                    editCheck.amount = check.amount;
                                } else {
                                    var newChecks = null;
                                    // Will be payed by installments ?
                                    if (newCheck.installments > 1) {
                                        newChecks = buildInstallments(newCheck);
                                    } else {
                                        var newCheckCopy = angular.copy(newCheck);
                                        newChecks = [
                                            newCheckCopy
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
                            }).then(function() {
                                var paymentIdx = $scope.payments.indexOf(payment);
                                $scope.payments.splice(paymentIdx, 1);
                                rebuildInstallmentIds();
                                $scope.clearCheck();
                                delete check.id;
                            });
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
                            // calc the installments amount.
                            
                            var installmentsAmount = installmentCalculation(newCheck.amount, newCheck.installments, $scope.subtotals);   
                            // save the installments number so we can delete it
                            var installmentsNumber = newCheck.installments;
                            delete newCheck.installments;

                            var installmentsSum = 0;
                            for ( var i = 0; i < installmentsNumber; i++) {
                                // make a copy
                                var checkInstallment = angular.copy(newCheck);

                                checkInstallment.number = '' + (Number(newCheck.number) + i);

                                checkInstallment.duedate = properDate(checkInstallment.duedate, i);

//                                if (Number(installmentsNumber) === i + 1) {
//                                    var finalAmount = newCheck.amount - installmentsSum;
//                                    finalAmount = Math.round(finalAmount * 100) / 100;
//                                    checkInstallment.amount = finalAmount;
//                                } else {
                                    checkInstallment.amount = installmentsAmount[i];
                                
//                                }
                                installmentsSum = Math.round((installmentsSum + checkInstallment.amount) * 100) / 100;
                                newChecks.push(checkInstallment);
                            }
                            if (installmentsSum !== $scope.subtotals) {
                                $log.info('PaymentCheckCtrl.buildInstallments: -The sum of the installments and the amount are' +
                                    ' different, installmentsSum=' + installmentsSum + ' originalAmount=' + $scope.subtotals);
                            }
                            return newChecks;
                        }
                        
                        function installmentCalculation(amount, installments, totalAmount){
                            
                            var amounts = [];
                            var total = 0;
                            var remaining = totalAmount - amount;
                            var remainingInstallments = Math.round ((remaining *100) / (installments-1))/100;
                            amounts.push(amount);
                            for(var i=0;i<installments;i++){
                                if(amounts.length === installments-1){
                                    for(var x in amounts){
                                        total += amounts[x];
                                    }
                                    amounts.push(Math.round((totalAmount*100 - total*100))/100);
                                }else{
                                    amounts.push(remainingInstallments);
                                    console.log(amounts);
                                }
                            }
                            return amounts;
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
                            for(var ix in newChecks){
                                newChecks[ix].id = $scope.payments.length+1;
                                $scope.payments.push(newChecks[ix]);
                            };
//                            $scope.payments = newChecks;
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
                                                            // Done this way
                                                            // cause when
                                                            // everything is
                                                            // placed in one row
                                                            // the code became
                                                            // damn ugly.
                                                            result = item.bank === newCheck.bank;
                                                            result = result && (item.agency === newCheck.agency);
                                                            result = result && (item.account === newCheck.account);
                                                            result = result && (Number(item.number) >= Number(newCheck.number));
                                                            result =
                                                                    result &&
                                                                        (Number(item.number) <= ((Number(newCheck.number) + Number(newCheck.installments)) - 1));
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
