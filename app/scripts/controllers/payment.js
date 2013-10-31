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
                        $scope.payments = {
                            checks : [],
                            creditCards : []
                        };
                        $scope.productsTotal = 0;
                        $scope.cash = 0;

                        $scope.filterQty = function(product) {
                            return product.qty;
                        };

                        $scope.productsCount = 0;

                        $scope.$watch('dataProvider.products', watchProducts, true);

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
                        $scope.openDialogProductExchange = DialogService.openDialogProductExchange;
                        $scope.openDialogAdvanceMoney = DialogService.openDialogAdvanceMoney;

                        $scope.goToBasket = function() {
                            $location.path('basket');
                        };

                        function confirmDialogFactory() {
                            var openMessageDialogIntent = $q.defer();
                            var openMessageDialogPromise = openMessageDialogIntent.promise.then(openMessageAttempt);

                            $scope.confirm = openMessageDialogIntent.resolve;
                            return openMessageDialogPromise;
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

                        function main() {
                            var savedCustomerId = 0;
                            var savedOrderAmount = 0;

                            var messageDialogPromise = confirmDialogFactory();
                            messageDialogPromise.then(function() {
                                savedCustomerId = OrderService.order.customerId;
                                savedOrderAmount = $scope.productsTotal;
                                OrderService.placeOrder();
                                OrderService.createOrder();
                                goHome();
                            }, function() {
                                main();
                            });
                            var sendSMSMessageDialogPromise = messageDialogPromise.then(openSMSMessageAttempt);
                            // FIXME - Get a real representative name.
                            var resultDialogPromise =
                                    sendSMSMessageDialogPromise.then(function() {

                                        var recoveredCustomer = $filter('filter')(DataProvider.customers, function(customer) {
                                            return customer.id === savedCustomerId;
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
                                                            '{{orderAmount}}', $filter('currency')(savedOrderAmount, '')).replace(
                                                            '{{representativeName}}', 'Valtanette');
                                            return MessageService.sendSMS('55' + phone, msg);
                                        } else {
                                            return 'Não foi possível enviar o SMS, o cliente ' + recoverdCustomerFirstName +
                                                ' não possui um número de celular em seu cadastro.';
                                        }
                                    });
                            resultDialogPromise.then(openResultDialogAttempt);
                        }
                        main();
                    });
}(angular));
