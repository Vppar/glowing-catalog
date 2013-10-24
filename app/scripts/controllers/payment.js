(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('PaymentCtrl', function($filter, $scope, $dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider; 
        
        $scope.payments = {
                total : 0,
                checks : [],
                checksTotal : 0,
                creditCards : [],
                creditCardsTotal : 0
        };
        
        $scope.productsTotal = 0;
        
        $scope.filterQtde = function(product) {
            return product.qtde;
        };
        
        $scope.productsCount = 0;
        
        $scope.$watch('dataProvider.products', watchProducts, true);
        
        function watchProducts() {
            $scope.productsTotal = 0;
            var products = $filter('filter')($scope.dataProvider.products, $scope.filterQtde);
            $scope.productsCount = products.length;
            
            for(var i=0; i<products.length; i++) {
                $scope.productsTotal += Number(products[i]["price"] * products[i]["qtde"]);
            }
        }
        
        $scope.openDialogCheck = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.payments = $scope.payments;
            d.open('views/parts/payment/payment-check-dialog.html', 'PaymentCheckDialogCtrl');
        };
        $scope.openDialogCard = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.payments = $scope.payments;
            d.open('views/parts/payment/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl');
        };
        $scope.openDialogProductExchange = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/payment/payment-product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl');
        };
        $scope.openDialogAdvanceMoney = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/payment/payment-advance-money-dialog.html', 'PaymentAdvanceMoneyDialogCtrl');
        };
        $scope.openDialogEditPass = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/payment/edit-pass-dialog.html', 'EditPassDialogCtrl');
        };
        $scope.goToBasket = function() {
            $location.path('basket');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        }

        $scope.cash = 0;
	
	$scope.customer = DataProvider.customer;
});
}(angular));
