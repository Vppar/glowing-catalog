(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.data', 'tnt.catalog.payment.service', 'tnt.catalog.payment.entity'
    ]).controller(
            'PaymentCreditCardCtrl',
            function($scope, $element, $filter, DataProvider, OrderService, CreditCardPayment, PaymentService) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################

                $scope.orderNumber = OrderService.order.code;

                // Initializing credit card data with a empty credit card
                var creditCard = {};
                var emptyCreditCardTemplate = {
                    installment : '1 x',
                    flag : null,
                    amount : $scope.totals.payments.remaining,
                    expirationMonth : null,
                    expirationYear : null,
                    number : null,
                    cvv : null,
                    cardholderName : null,
                    // cardholder's CPF
                    cardholderDocument : null
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

                $scope.checkCreditCardFlagChange = function(cardFlag) {
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

                // Creates an array containing year options for credit card
                // expiration
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
                 * Confirms a credit card payment.
                 */
                $scope.confirmCreditCardPayment =
                        function confirmCreditCardPayment() {
                            $element.find('form').find('input').removeClass('ng-pristine').addClass('ng-dirty');
                            if (!($scope.creditCardForm.$valid && $scope.creditCard.amount > 0)) {
                                return;
                            }

                            // TODO: check dueDate format
                            var dueDate = creditCard.expirationMonth + '-' + creditCard.expirationYear, payment =
                                    new CreditCardPayment(
                                            creditCard.amount, creditCard.flag, creditCard.number, creditCard.cardholderName, dueDate,
                                            creditCard.cvv, creditCard.cardholderDocument, creditCard.installments);
                            payment.orderNumber = $scope.orderNumber;
                            PaymentService.add(payment);
                            $scope.selectPaymentMethod('none');
                        };

            });
}(angular));
