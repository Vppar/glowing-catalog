(function(angular) {
    'use strict';

    angular
            .module('glowingCatalogApp')
            .controller(
                    'PaymentCtrl',
                    function($filter, $scope, $dialog, $location, $q, DataProvider, DialogService, OrderService, MessageService) {

                        var defaultMsg =
                                'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. {{representativeName}} seu consultor Mary Kay.';

                        $scope.dataProvider = DataProvider;
                        $scope.payments = DataProvider.payments.currentPayments;
                        $scope.productsTotal = 0;
                        $scope.cash = 0;

                        $scope.productsCount = 0;

                        $scope.$watch('dataProvider.products', watchProducts, true);

                        $scope.filterQty = function(product) {
                            return product.qty;
                        };

                        $scope.openDialogAdvanceMoney = DialogService.openDialogAdvanceMoney;
                        $scope.openDialogProductExchange = DialogService.openDialogProductExchange;
                        $scope.openDialogCheck = function openDialogCheck() {
                            DialogService.openDialogCheck({
                                payments : $scope.payments
                            });
                        };
                        $scope.openDialogCreditCard = function openDialogCreditCard() {
                            DialogService.openDialogCreditCard({
                                payments : $scope.payments
                            });
                        };
                        $scope.goToBasket = function() {
                            $location.path('basket');
                        };

                        function confirmPaymentDialogFactory() {
                            var openConfirmPaymentDialogIntent = $q.defer();
                            var openConfirmPaymentDialogPromise = openConfirmPaymentDialogIntent.promise.then(openMessageAttempt);

                            $scope.confirm = openConfirmPaymentDialogIntent.resolve;
                            return openConfirmPaymentDialogPromise;
                        }

                        function openMessageAttempt() {
                            return DialogService.messageDialog({
                                title : 'Confirmar pagamento',
                                message : 'Deseja confirmar o pagamento?',
                                btnYes : 'Confirmar',
                                btnNo : 'Cancelar'
                            });
                        }
                        function openSMSMessageAttempt() {
                            return DialogService.messageDialog({
                                title : 'Confirmar envio de SMS',
                                message : 'Deseja enviar o SMS de alerta para o cliente?',
                                btnYes : 'Sim',
                                btnNo : 'Não'
                            });
                        }
                        function openResultDialogAttempt(message) {
                            return DialogService.messageDialog({
                                title : 'Envio de SMS',
                                message : message,
                                btnYes : 'OK',
                            });
                        }

                        function watchProducts() {
                            $scope.productsTotal = 0;
                            var products = $filter('filter')($scope.dataProvider.products, $scope.filterQty);
                            $scope.productsCount = products.length;

                            for ( var i = 0; i < products.length; i++) {
                                $scope.productsTotal += Number(products[i].price * products[i].qty);
                            }
                        }
                        function goHome() {
                            $location.path('/');
                        }

                        function sendSMSAttempt(data) {
                            var recoveredCustomer = $filter('filter')(DataProvider.customers, function(customer) {
                                return customer.id === customerId;
                            })[0];
                            var recoverdCustomerFirstName = recoveredCustomer.name.split(' ')[0];

                            // find a cellphone
                            var cellphone = null;
                            var phone = null;
                            for ( var idx in recoveredCustomer.phones) {
                                phone = recoveredCustomer.phones[idx].number;
                                if (Number(phone.charAt(2)) >= 7) {
                                    cellphone = phone;
                                    break;
                                }
                            }
                            if (cellphone) {
                                var msg =
                                        defaultMsg.replace('{{customerName}}', recoverdCustomerFirstName).replace(
                                                '{{orderAmount}}', $filter('currency')(orderAmount, '')).replace(
                                                '{{representativeName}}', 'Valtanette');
                                return MessageService.sendSMS('55' + phone, msg);
                            } else {
                                return 'Não foi possível enviar o SMS, o cliente ' + recoverdCustomerFirstName +
                                    ' não possui um número de celular em seu cadastro.';
                            }
                        }

                        function main() {
                            var confirmPaymentDialogPromise = confirmPaymentDialogFactory();
                            confirmPaymentDialogPromise.then(function() {
                                var data = {
                                    customerId : OrderService.order.customerId,
                                    orderAmount : $scope.productsTotal
                                };

                                OrderService.placeOrder();
                                OrderService.createOrder();
                                goHome();

                                return data;
                            }, function() {
                                main();
                            });
                            var sendSMSMessageDialogPromise = confirmPaymentDialogPromise.then(openSMSMessageAttempt);
                            // FIXME - Get a real representative name.
                            var resultDialogPromise = sendSMSMessageDialogPromise.then(sendSMSAttempt);
                            resultDialogPromise.then(openResultDialogAttempt);
                        }
                        main();
                    });
}(angular));
