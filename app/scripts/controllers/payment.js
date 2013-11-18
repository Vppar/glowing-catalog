(function(angular) {
    'use strict';
    angular.module('tnt.catalog.payment', []).controller(
            'PaymentCtrl', function($scope, $filter, $location, $q, DataProvider, DialogService, PaymentService, OrderService, SMSService) {

                $scope.payments = PaymentService.payments;
                $scope.items = OrderService.order.items;

                // #############################################################################################
                // Payment related dialogs
                // #############################################################################################

                $scope.openDialogCheck = function openDialogCheck() {
                    DialogService.openDialogCheck({
                        payments : $scope.payments
                    }).then(function(payment) {
                        angular.extend($scope.payments, payments);
                    });
                };
                $scope.openDialogCreditCard = function openDialogCreditCard() {
                    DialogService.openDialogCreditCard({
                        payments : $scope.payments
                    }).then(function(payments) {
                        angular.extend($scope.payments, payments);
                    });
                };
                $scope.openDialogAdvanceMoney = DialogService.openDialogAdvanceMoney;
                $scope.openDialogProductExchange = DialogService.openDialogProductExchange;

                // #############################################################################################
                // Screen actions functions
                // #############################################################################################

                function paymentFactory() {
                    var paymentIntent = $q.defer();
                    var confirmedPaymentPromise = paymentIntent.promise.then(showPaymentConfirmationDialog);

                    $scope.confirm = paymentIntent.resolve;

                    return confirmedPaymentPromise;
                }

                $scope.cancel = function cancel() {
                    PaymentService.clear();
                    $location.path('/');
                };

                // #############################################################################################
                // Alert dialogs functions
                // #############################################################################################

                function showPaymentConfirmationDialog() {
                    return DialogService.messageDialog({
                        title : 'Pagamento',
                        message : 'Deseja confirmar o pagamento?',
                        btnYes : 'Confirmar',
                        btnNo : 'Cancelar'
                    });
                }

                function showPaymentDoneDialog() {
                    $location.path('/');
                    return DialogService.messageDialog({
                        title : 'Pagamento',
                        message : 'Pagamento efetuado!',
                        btnYes : 'OK',
                    });
                }

                // #############################################################################################
                // Main function
                // #############################################################################################

                function validatePayment() {
                    var orderAmount = $filter('sum')(OrderService.order.items, 'price', 'qty');
                    var paymentAmount = $filter('sum')($scope.payments, 'amount');
                    
                    if (paymentAmount === orderAmount) {
                        return true;
                    }
                    
                    var message = null;
                    
                    if (paymentAmount > orderAmount) {
                        message = 'Valor registrado para pagamento é maior do que o valor total do pedido.';
                    } else if (paymentAmount < orderAmount) {
                        message = 'Valor registrado para pagamento é menor do que o valor total do pedido.';
                    }
                    return $q.reject(message);
                }
                
                function makePayment() {
                    var savedOrder = OrderService.save();
                    OrderService.clear();
                    var savedPayments = PaymentService.save(savedOrder.id, savedOrder.customerId);
                    PaymentService.clear();

                    for ( var idx in savedPayments) {
                        var savedPayment = savedPayments[idx];
                        savedOrder.paymentIds.push(savedPayment.id);
                    }
                    return savedOrder;
                }
                
                function abortPayment(message){
                    // rebuild main promise chain.
                    main();
                    // show the dialog.
                    DialogService.messageDialog({
                        title : 'Pagamento',
                        message : message,
                        btnYes : 'OK',
                    });
                    return $q.reject();
                }

                function sendAlertSMSAttempt(order) {
                    var customer = $filter('findBy')(DataProvider.customers, 'id', order.customerId);
                    var orderAmount = $filter('sum')(OrderService.order.items, 'price', 'qty');
                    return SMSService.sendPaymentConfirmation(customer, orderAmount);
                }

                function main() {
                    // Execute when payment is confirmed.
                    var confirmedPaymentPromise = paymentFactory();
                    var validadedPaymentPromise = confirmedPaymentPromise.then(validatePayment, main);
                    var paidPromise = validadedPaymentPromise.then(makePayment, abortPayment);

                    // Send the alert SMS to the customer.
                    var smsSentPromise = paidPromise.then(sendAlertSMSAttempt);

                    // Open the payment confirmation alert.
                    smsSentPromise.then(showPaymentDoneDialog);
                }

                main();
            });
}(angular));
