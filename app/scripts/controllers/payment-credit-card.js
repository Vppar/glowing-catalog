(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', [
        'tnt.catalog.service.data', 'tnt.catalog.service.payment'
    ]).controller('PaymentCreditCardCtrl', function($scope, $element, $filter, DataProvider, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing credit card data with a empty credit card
        var creditCard = {};
        var emptyCheckTemplate = {
            installment : null,
            flag : null,
            amount : null
        };
        angular.extend(creditCard, emptyCheckTemplate);

        // Credit card informations to fill the screen combos.
        $scope.cardFlags = DataProvider.cardData.flags;
        $scope.installments = DataProvider.cardData.installments;

        // #####################################################################################################
        // Scope action functions
        // #####################################################################################################

        /**
         * Adds a credit card payment to the last position of $scope.payments.
         * 
         * @param newCreditCard - the object containing the newCreditCard data.
         */
        $scope.addCreditCard = function(newCreditCard) {
            if (!newCreditCard.amount || newCreditCard.amount === 0) {
                return;
            }
            // check if the all mandatory fields are filed.
            if ($scope.creditCardForm.$valid) {
                // check if is duplicated.
                var payment = PaymentService.createNew('creditcard');
                payment.amount = newCreditCard.amount;
                delete newCreditCard.amount;
                payment.data = angular.copy(newCreditCard);
                $scope.creditCardForm.$pristine = true;
                $scope.creditCardForm.$dirty = false;
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            }
        };

        /**
         * Removes selected check from $scope.payments array
         * 
         * @param paymentId - payment id of the check to be removed.
         */
        $scope.removeCreditCard = function removeCheck(payment) {
            var index = $scope.payments.indexOf(payment);
            $scope.payments.splice(index, 1);
        };

    });
}(angular));