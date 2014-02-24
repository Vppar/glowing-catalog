(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.dialog', 'tnt.catalog.service.data', 'tnt.catalog.payment.creditcard.service'
    ]).controller(
            'PaymentCreditCardCtrl',
            function($scope, $element, $filter, DataProvider, DialogService, OrderService, CreditCardPaymentService) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################

                $scope.orderNumber = OrderService.order.code;

                function getAmount(change) {
                    return !change || change > 0 ? 0 : -change;
                }

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

                DataProvider.reloadGoPay();
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
                creditCard.expirationMonth = new Date().getMonth() + 1;
                creditCard.expirationYear = new Date().getFullYear();
                $scope.cardExpirationYears = cardExpirationYears;

                $scope.$watch('creditCard.expirationYear', function() {
                    if (Number(creditCard.expirationYear) === new Date().getFullYear()) {
                        var minMonth = new Date().getMonth() + 1;
                        var months = [];
                        for ( var ix in DataProvider.date.months) {
                            if (Number(DataProvider.date.months[ix].id) >= minMonth)
                                months.push(DataProvider.date.months[ix]);
                        }
                        $scope.months = months;
                    } else {
                        $scope.months = DataProvider.date.months;
                    }
                });

                $scope.$watch('gopay.merchant', reloadCardFlags);
                $scope.$watch('envFlags.internet', reloadCardFlags);

                function reloadCardFlags(newVal, oldVal) {
                    if ($scope.gopay.merchant && $scope.envFlags.internet) {
                        $scope.cardFlags = DataProvider.cardData.goPayflags;
                    } else {
                        $scope.cardFlags = DataProvider.cardData.flags;
                    }
                }

                // #####################################################################################################
                // Scope action functions
                // #####################################################################################################
                /**
                 * Confirms a credit card payment.
                 */
                $scope.confirmCreditCardPayment = function confirmCreditCardPayment() {
                    $element.find('form').find('input').removeClass('ng-pristine').addClass('ng-dirty');
                    if (!($scope.creditCardForm.$valid && $scope.creditCard.amount > 0)) {
                        return;
                    }
                    var numInstallments = Number(creditCard.installment.replace('x', '').replace(' ', ''));

                    var isGoPay = $scope.gopay.merchant && $scope.envFlags.internet;
                    var result = CreditCardPaymentService.charge(creditCard, creditCard.amount, numInstallments, isGoPay);

                    result.then(function() {
                        $scope.selectPaymentMethod('none');
                    }, function(errMsg) {
                        DialogService.messageDialog({
                            title : 'Pagamento',
                            message : errMsg,
                            btnYes : 'OK'
                        });
                    });
                };

            });
}(angular));
