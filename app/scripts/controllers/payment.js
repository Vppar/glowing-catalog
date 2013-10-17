(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('PaymentCtrl', function($filter, $scope, $dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider; 
        
        $scope.checks = new Array();
        $scope.creditCards = new Array();
        
        $scope.checksSum = 0;
        $scope.creditCardsSum = 0;
        
        function sumArrayByProperty(array, property) {
            var total = 0;
            for(var i=0; i<array.length; i++) {
                total += Number(array[i][property]);
            }
            return total;
        }
        
        $scope.filterQtde = function(product) {
            return product.qtde;
        };
        
        $scope.productsCount = $filter('filter')($scope.dataProvider.products, $scope.filterQtde).length;
        
        function onCheckSuccessFunction(param) {
            $scope.checks = param;
            $scope.checksSum = sumArrayByProperty($scope.checks, "amount");
            //alert($scope.checksSum);
        }
        
        function onCreditCardSuccessFunction(param) {
            $scope.creditCards = param;
            $scope.creditCardsSum = sumArrayByProperty($scope.creditCards, "value");
        }
        
        function defaultFailureFunction(param) {
            //alert("onFailureFunction: " + param);
        }
        
        $scope.openDialogCheck = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.checks = $scope.checks;
            d.open('views/payment-check-dialog.html', 'PaymentCheckDialogCtrl').then(onCheckSuccessFunction, defaultFailureFunction);
        };
        $scope.openDialogCard = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.creditCards = $scope.creditCards;
            d.open('views/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl').then(onCreditCardSuccessFunction, defaultFailureFunction);
        };
        $scope.openDialogProductExchange = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl');
        };
        $scope.openDialogAdvanceMoney = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/payment-advance-money-dialog.html', 'PaymentAdvanceMoneyDialogCtrl');
        };
        $scope.openDialogEditPass = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
        };
        $scope.goToBasket = function() {
            $location.path('basket');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        }

        $scope.cash = 12.98;
	
	$scope.customer = DataProvider.customer;
});
}(angular));
