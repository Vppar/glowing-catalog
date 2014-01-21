(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff', [
        'tnt.catalog.service.coupon', 'tnt.catalog.service.dialog'
    ]).controller(
            'PaymentOnCuffCtrl',
            function($filter, $scope, $log, CouponService, DialogService, DataProvider, OrderService) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################
                $scope.payments = [];

                var order = OrderService.order;

                //find customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                if($scope.total.change<0){
                    $scope.amount = $scope.total.change*-1;
                }else{
                    $scope.amount = 0;
                }
                 
                $scope.installmentQty = 1;
                $scope.dueDate = new Date();

                var emptyInstallmentTemplate = {
                    installment : 1,
                    dueDate : null,
                    amount : 0
                };

                $scope.$watch('dueDate', function() {
                    $scope.computeInstallments();
                });

                //Compute amount and installments ang compute.
                $scope.computeInstallments = function computeInstallments() {
                    $scope.payments = [];
                    var payment = {};
                    if ($scope.installmentQty > 1) {
                        angular.extend(payment, emptyInstallmentTemplate);
                        payment.dueDate = $scope.dueDate;
                        payment.amount = $scope.amount;
                        payment.installment = $scope.installmentQty;
                        $scope.payments = buildInstallments(payment);
                    } else {
                        angular.extend(payment, emptyInstallmentTemplate);
                        payment.dueDate = $scope.dueDate;
                        payment.amount = $scope.amount;
                        payment.installment = $scope.installmentQty;
                        $scope.payments.push(payment);
                    }
                };

                //We need to call the first time to compute within initial values.
                $scope.computeInstallments();

                function buildInstallments(payment) {
                    var installments = [];
                    var index = 1;
                    var installmentsAmount = Math.round(payment.amount * 100 / $scope.installmentQty) / 100;
                    var installmentsNumber = $scope.installmentQty;

                    var installmentsSum = 0;
                    for ( var i = 0; i < installmentsNumber; i++) {
                        var checkInstallment = angular.copy(payment);
                        checkInstallment.dueDate = properDate(checkInstallment.dueDate, i);
                        if (Number(installmentsNumber) === i + 1) {
                            var finalAmount = payment.amount - installmentsSum;
                            finalAmount = Math.round(finalAmount * 100) / 100;
                            checkInstallment.amount = finalAmount;
                        } else {
                            checkInstallment.amount = installmentsAmount;
                        }
                        installmentsSum = Math.round((installmentsSum + checkInstallment.amount) * 100) / 100;
                        checkInstallment.installment = index++;
                        installments.push(checkInstallment);
                    }
                    if (installmentsSum !== payment.amount) {
                        $log.info('PaymentCheckCtrl.buildInstallments: -The sum of the installments and the amount are' +
                            ' different, installmentsSum=' + installmentsSum + ' originalAmount=' + payment.amount);
                    }
                    return installments;
                }

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
