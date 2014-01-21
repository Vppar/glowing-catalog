(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.oncuff', [
        'tnt.catalog.service.coupon', 'tnt.catalog.service.dialog', 'tnt.catalog.misplaced.service', 'tnt.catalog.misplaced.service'
    ]).controller(
            'PaymentOnCuffCtrl',
            function($filter, $scope, $log, CouponService, DialogService, DataProvider, OrderService, Misplacedservice) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################
                $scope.payments = [];
                
                var order = OrderService.order;

                // find customer
                var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                $scope.customer = customer;

                if ($scope.total.change < 0) {
                    $scope.amount = $scope.total.change * -1;
                } else {
                    $scope.amount = 0;
                }
                
                $scope.$watch('dueDate', function() {
                    $scope.computeInstallments();
                });

                $scope.installmentQty = 1;
                $scope.dueDate = new Date();

                var emptyInstallmentTemplate = {
                    installment : 1,
                    dueDate : null,
                    amount : 0
                };

                // Compute amount and installments ang compute.
                $scope.computeInstallments = function computeInstallments() {
                    if ($scope.installmentQty > 99) {
                        $scope.installmentQty = 1;
                    }
                    $scope.payments = [];
                    var payment = {};
                    if ($scope.installmentQty > 1) {
                        angular.extend(payment, emptyInstallmentTemplate);
                        payment.dueDate = $scope.dueDate;
                        payment.amount = $scope.amount;
                        payment.installment = $scope.installmentQty;
                        createInstallment(payment, $scope.dueDate);
                        $scope.payments = Misplacedservice.recalc($scope.amount, -1, $scope.payments, 'amount');
                    } else {
                        angular.extend(payment, emptyInstallmentTemplate);
                        payment.dueDate = $scope.dueDate;
                        payment.amount = $scope.amount;
                        payment.installment = $scope.installmentQty;
                        $scope.payments.push(payment);
                    }
                };
                
                $scope.valueCheck = function valueCheck(index){
                    $scope.payments = Misplacedservice.recalc($scope.amount, index, $scope.payments, 'amount');
                };

                // We need to call the first time to compute within initial
                // values.
                $scope.computeInstallments();

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
            });
}(angular));
