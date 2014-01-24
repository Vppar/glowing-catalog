(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.payment.oncuff',
            [
                'tnt.catalog.service.coupon', 'tnt.catalog.service.dialog', 'tnt.catalog.misplaced.service', 'tnt.catalog.payment.service',
                'tnt.catalog.payment.entity'
            ]).controller(
            'PaymentOnCuffCtrl',
            function($filter, $scope, $log, DialogService, DataProvider, OrderService, Misplacedservice, PaymentService, OnCuffPayment) {
                var emptyInstallmentTemplate = {
                    installment : 1,
                    dueDate : null,
                    amount : 0
                };
                $scope.dateMin = new Date();
                // Compute amount and installments and compute.
                $scope.computeInstallments = function computeInstallments() {
                    $scope.payments = [];
                    var payment = {};
                    angular.extend(payment, emptyInstallmentTemplate);
                    payment.dueDate = $scope.dueDate;
                    payment.amount = $scope.amount;
                    payment.installment = $scope.installmentQty;
                    createInstallment(payment, $scope.dueDate);
                    $scope.payments = Misplacedservice.recalc($scope.amount, -1, $scope.payments, 'amount');
                };

                $scope.valueCheck = function valueCheck(index) {
                    $scope.payments = Misplacedservice.recalc($scope.amount, index, $scope.payments, 'amount');
                };

                // We need to call the first time to compute within initial
                // values.

                $scope.confirmOnCuffPayment = function confirmOnCuffPayment() {
                    PaymentService.clear('onCuff');
                    for ( var ix in $scope.payments) {
                        var data = $scope.payments[ix];
                        if (data.amount > 0) {
                            var payment = new OnCuffPayment(data.amount, data.dueDate);
                            payment.installment = data.installment;
                            PaymentService.add(payment);
                        }
                    }
                    $scope.selectPaymentMethod('none');
                };

                function createInstallment(payment, baseDate) {
                    for ( var ix = 0; ix < payment.installment; ix++) {
                        var copyDate = angular.copy(baseDate);
                        var pay = {};
                        angular.extend(pay, emptyInstallmentTemplate);
                        pay.dueDate = properDate(copyDate, ix);
                        pay.installment = ix + 1;
                        $scope.payments.push(pay);
                    }
                }

                function properDate(baseDate, increase) {
                    var date = new Date(baseDate.getYear(), baseDate.getMonth() + 1 + increase, 0);
                    if (baseDate.getDate() > date.getDate()) {
                        return date;
                    } else {
                        return baseDate.setMonth(baseDate.getMonth() + increase);
                    }
                }

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################
                $scope.payments = [];
                $scope.payments = PaymentService.list('onCuff');
                var order = OrderService.order;

                // find customer
                $scope.customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                
                $scope.amount=0;
                if ($scope.payments.length === 0) {
                    $scope.installmentQty = 1;
                    $scope.dueDate = new Date();
                    if ($scope.total.change < 0) {
                        $scope.amount = $scope.total.change * -1;
                    } else {
                        //show dialog
                        DialogService.messageDialog({
                            title : 'Contas a receber',
                            message : 'Não existem valores para serem lançados.',
                            btnYes : 'OK'
                        }).then(function() {
                            $scope.selectPaymentMethod('none');
                        });

                    }
                    $scope.computeInstallments();
                } else {
                    $scope.amount = $filter('sum')($scope.payments, 'amount');
                    $scope.installmentQty = $scope.payments.length;
                    $scope.dueDate = new Date($scope.payments[0].dueDate);
                }

                $scope.$watch('dueDate',  function(val, old) {
                    var test = val+'';
                    if (val !== old && val && val.lenght == 8 ) {
                        $scope.computeInstallments();
                    }
                });
                $scope.$watch('amount', function(val, old) {
                    if (val !== old) {
                        $scope.computeInstallments();
                    }
                });
                
            });
}(angular));
