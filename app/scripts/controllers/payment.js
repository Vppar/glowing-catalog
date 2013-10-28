(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
            'PaymentCtrl', function($filter, $scope, $dialog, $location, DataProvider, DialogService, OrderService) {

                $scope.dataProvider = DataProvider;
                $scope.customer = DataProvider.customer;
                $scope.payments = DataProvider.currentPayments;
                $scope.cash = 0;
                $scope.productsTotal = 0;

                $scope.confirm = function() {
                    return DialogService.confirmationDialog({
                        title : 'Confirmar pagamento',
                        message : 'Deseja confirmar o pagamento ?',
                    }).then(function(result) {
                        if (result) {
                            OrderService.placeOrder();
                            OrderService.createOrder();
                            $location.path('/');
                        }
                    });
                };

                $scope.filterQty = function(product) {
                    return product.qty;
                };

                $scope.productsCount = 0;

                $scope.$watch('dataProvider.products', watchProducts, true);

                function watchProducts() {
                    $scope.productsTotal = 0;
                    var products = $filter('filter')($scope.dataProvider.products, $scope.filterQty);
                    $scope.productsCount = products.length;

                    for ( var i = 0; i < products.length; i++) {
                        $scope.productsTotal += Number(products[i].price * products[i].qty);
                    }
                }

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
            });
}(angular));
