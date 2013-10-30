(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'PaymentCtrl', function($filter, $scope, $dialog, $location, $q, DataProvider, DialogService, OrderService, MessageService) {

                $scope.dataProvider = DataProvider;
                $scope.customer = DataProvider.customer;
                $scope.payments = DataProvider.currentPayments;
                $scope.cash = 0;
                $scope.productsTotal = 0;

                function confirmDialogFactory() {
                    var openConfirmationDialogIntent = $q.defer();
                    var openConfirmationDialogPromise = openConfirmationDialogIntent.promise.then(openConfirmationAttempt);

                    $scope.confirm = openConfirmationDialogIntent.resolve;
                    return openConfirmationDialogPromise;
                }

                function openConfirmationAttempt() {
                    return DialogService.confirmationDialog({
                        title : 'Confirmar pagamento',
                        message : 'Deseja confirmar o pagamento ?',
                        btnYes : 'Confirmar',
                        btnNo : 'Cancelar'
                    });
                }

                function openSMSConfirmationAttempt() {
                    return DialogService.confirmationDialog({
                        title : 'Confirmar envio de SMS',
                        message : 'Deseja enviar o SMS de alerta para o cliente ?',
                        btnYes : 'Sim',
                        btnNo : 'Não'
                    });
                }

                $scope.filterQty = function(product) {
                    return product.qty;
                };

                $scope.productsCount = 0;

                function watchProducts() {
                    $scope.productsTotal = 0;
                    var products = $filter('filter')($scope.dataProvider.products, $scope.filterQty);
                    $scope.productsCount = products.length;

                    for ( var i = 0; i < products.length; i++) {
                        $scope.productsTotal += Number(products[i].price * products[i].qty);
                    }
                }

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

                function goHome() {
                    $location.path('/');
                }

                function main() {
                    var confirmationDialogPromise = confirmDialogFactory();
                    confirmationDialogPromise.then(function() {
                        OrderService.placeOrder();
                        OrderService.createOrder();
                    }, function() {
                        main();
                    });
                    confirmationDialogPromise.then(openSMSConfirmationAttempt).then(function() {
                        MessageService.sendSMS('554196665488','Ola Arnaldo,\r\n seu pedido no valor de R$20,00 foi confirmado.\r\nValtanette seu consultor Mary Kay.');
                    }, goHome);

                }
                main();
            });
}(angular));
