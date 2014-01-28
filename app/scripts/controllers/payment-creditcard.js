(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.data', 'tnt.catalog.payment.service', 'tnt.catalog.payment.entity'
    ]).controller('PaymentCreditCardCtrl', function($scope, $element, $filter, DataProvider, OrderService, CreditCardPayment, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        $scope.orderNumber = OrderService.order.code;

        function getAmount(change) {
          return !change || change > 0 ? 0 : -change;
        };

        // Initializing credit card data with a empty credit card
        var creditCard = {};
        var emptyCreditCardTemplate = {
            installment : '1 x',
            flag : null,
            amount : getAmount($scope.total.change),
            expirationMonth : null,
            expirationYear : null,
            number : null,
            cvv : null,
            cardholderName : null,
            cardholderDocument : null // cardholder's CPF
        };
        angular.extend(creditCard, emptyCreditCardTemplate);
        $scope.creditCard = creditCard;

        // Credit card informations to fill the screen combos.
        $scope.cardFlags = DataProvider.cardData.flags;
        // select MasterCard
        $scope.creditCard.flag = DataProvider.cardData.flags[6]; 
        $scope.installments = DataProvider.cardData.installments;

        $scope.gopay = DataProvider.gopay;
        $scope.envFlags = DataProvider.envFlags;
        
        $scope.months = DataProvider.date.months;

        $scope.select2Options = {
            minimumResultsForSearch : -1
        };


        $scope.creditCardMask = '';
        $scope.creditCardCvvLength = 3;

        function resetCardNumberAndCvv() {
          $scope.creditCard.number = null;
          $scope.creditCard.cvv = null;
        }

        $scope.checkCreditCardFlagChange = function (cardFlag) {
          // Changing from any flag/no flag to American Express
          if (cardFlag === 'American Express') {
            $scope.creditCardMask = 'amex';
            $scope.creditCardCvvLength = 4;
            resetCardNumberAndCvv();

          // Changing from American Express to other flag
          } else if ($scope.creditCardMask === 'amex') {
            $scope.creditCardMask = '';
            $scope.creditCardCvvLength = 3;
            resetCardNumberAndCvv();
          }

          // Changing from a non-Amex flag to another, do nothing
        };

        // Creates an array containing year options for credit card expiration
        // dates
        var currYear = new Date().getFullYear();
        var cardMaxExpirationYear = currYear + 10;
        var cardExpirationYears = [];
        while (currYear < cardMaxExpirationYear) {
            cardExpirationYears.push(currYear++);
        }

        creditCard.expirationMonth = 1;
        creditCard.expirationYear = new Date().getFullYear();
        $scope.cardExpirationYears = cardExpirationYears;


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
                // var payment = PaymentService.createNew('creditcard');
                // payment.amount = newCreditCard.amount;
                delete newCreditCard.amount;
                // payment.data = angular.copy(newCreditCard);
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

        /**
         * Confirms a credit card payment.
         */
        $scope.confirmCreditCardPayment = function confirmCreditCardPayment() {
            $element.find('form').find('input').removeClass('ng-pristine').addClass('ng-dirty');
            var validate = true;
            for(var idx in $scope.creditCard){
                if(!$scope.creditCard || $scope.creditCard[idx] === ''){
                    validate = false;
                    break;
                }
            }
      
            if (!$scope.creditCardForm.$valid || !validate) {
                // XXX: should be loged?
                return;
            }
            
            var
                // TODO: check dueDate format
            
                dueDate = creditCard.expirationMonth + '-' + creditCard.expirationYear,
                payment = new CreditCardPayment(
                    creditCard.amount,
                    creditCard.flag,
                    creditCard.number,
                    creditCard.cardholderName,
                    dueDate,
                    creditCard.cvv,
                    creditCard.cardholderDocument,
                    creditCard.installments
                );
            payment.orderNumber = $scope.orderNumber;
            PaymentService.add(payment);
            $scope.selectPaymentMethod('none');
        };

    });
}(angular));
