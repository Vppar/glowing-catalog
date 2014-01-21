(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.data', 'tnt.catalog.payment.service'
    ]).controller('PaymentCreditCardCtrl', function($scope, $element, $filter, DataProvider, OrderService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

    	$scope.orderNumber = OrderService.order.code;
    	
        // Initializing credit card data with a empty credit card
        var creditCard = {};
        var emptyCreditCardTemplate = {
            installment : null,
            flag : null,
            amount : null,
            expirationMonth : null,
            expirationyear : null,
            number : null,
            cvv : null,
            cardholderName : null,
            cardholderDocument : null // CPF
        };
        angular.extend(creditCard, emptyCreditCardTemplate);
        $scope.creditCard = creditCard;

        // Credit card informations to fill the screen combos.
        $scope.cardFlags = DataProvider.cardData.flags;
        $scope.installments = DataProvider.cardData.installments;
        
        $scope.internet = DataProvider.internet;
        $scope.merchant = DataProvider.gopay.merchant;
        
        $scope.months = DataProvider.date.months;
        
        // Creates an array containing year options for credit card expiration dates
        var currYear = new Date().getFullYear();
        var cardMaxExpirationYear = currYear + 10;
        var cardExpirationYears = [];
        while (currYear < cardMaxExpirationYear) {
        	cardExpirationYears.push(currYear++);
        }
        
        $scope.cardExpirationYears = cardExpirationYears;

        // Recovering dialogService from parent scope.
        var dialogService = $scope.dialogService;

        // #####################################################################################################
        // Scope action functions
        // #####################################################################################################

        /**
         * Adds a credit card payment to the last position of $scope.payments.
         * 
         * @param newCreditCard - the object containing the newCreditCard data.
         */
        $scope.addCreditCard = function addCreditCard(newCreditCard) {
            if (!newCreditCard.amount || newCreditCard.amount === 0) {
                return;
            }
            
            // check if the all mandatory fields are filed.
            if ($scope.creditCardForm.$valid) {
                // check if is duplicated.
                GoPayService.pay(newCreditCard.amount, 'MaryKay pedido 123');
//                var payment = PaymentService.createNew('creditcard');
//                payment.amount = newCreditCard.amount;
                delete newCreditCard.amount;
//                payment.data = angular.copy(newCreditCard);
                $scope.creditCardForm.$pristine = true;
                $scope.creditCardForm.$dirty = false;
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            }
        };

        /**
         * Removes selected check from $scope.payments array
         * 
         * @param payment - credit card payment to be removed.
         */
        $scope.removeCreditCard = function removeCreditCard(payment) {
            var index = $scope.payments.indexOf(payment);
            $scope.payments.splice(index, 1);
        };

    });
}(angular));