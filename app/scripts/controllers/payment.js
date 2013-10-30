(function(angular) {
    'use strict';

    angular
            .module('glowingCatalogApp')
            .controller(
                    'PaymentCtrl',
                    function($filter, $scope, $dialog, $location, $q, DataProvider, DialogService, OrderService, MessageService) {

                        var defaultMsg =
                                'Ola {{customerName}}, seu pedido no valor de {{orderAmount}} reais foi confirmado. {{representativeName}} seu consultor Mary Kay.';

                        $scope.productsTotal = 0;
                        $scope.dataProvider = DataProvider;
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
                            var openConfirmationDialogIntent = $q.defer();
                            var openConfirmationDialogPromise = openConfirmationDialogIntent.promise.then(openConfirmationAttempt);

                            $scope.confirm = openConfirmationDialogIntent.resolve;
                            return openConfirmationDialogPromise;
                        }

                        function openConfirmationAttempt() {
                            return DialogService.confirmationDialog({
                                title : 'Confirmar pagamento',
                                message : 'Deseja confirmar o pagamento?',
                                btnYes : 'Confirmar',
                                btnNo : 'Cancelar'
                            });
                        }

                        function openSMSConfirmationAttempt() {
                            return DialogService.confirmationDialog({
                                title : 'Confirmar envio de SMS',
                                message : 'Deseja enviar o SMS de alerta para o cliente?',
                                btnYes : 'Sim',
                                btnNo : 'Não'
                            });
                        }
                        function openResultDialogAttempt(message) {
                            return DialogService.confirmationDialog({
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

                            var confirmationDialogPromise = confirmDialogFactory();
                            confirmationDialogPromise.then(function() {
                                savedCustomerId = OrderService.order.customerId;
                                savedOrderAmount = $scope.productsTotal;
                                OrderService.placeOrder();
                                OrderService.createOrder();
                                goHome();
                            }, function() {
                                main();
                            });
                            var sendSMSConfirmationDialogPromise = confirmationDialogPromise.then(openSMSConfirmationAttempt);
                            // FIXME - Get a real representative name.
                            var resultDialogPromise =
                                    sendSMSConfirmationDialogPromise.then(function() {

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
                                            return MessageService.sendSMS('554196665488', msg);
                                            // MessageService.sendSMS('554196665488','Ola
                                            // Wesley, seu pedido no valor de
                                            // 20,00
                                            // reais foi confirmado. Valtanette
                                            // seu
                                            // consultor Mary Kay.');

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
