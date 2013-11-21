(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.creditcard', []).controller('PaymentCreditCardCtrl', function($scope, $filter, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        var creditCard = {};
        var emptyCheckTemplate = {
            installments : null,
            flag : null,
            amount : null
        };
        angular.extend(creditCard, emptyCheckTemplate);

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        /**
         * Adds a credit card payment to the last position of $scope.payments.
         * 
         * @param newCreditCard - the object containing the newCreditCard data.
         */
        $scope.addCreditCard = function(newCreditCard) {
            // check if the all mandatory fields are filed.
            if ($scope.creditCardForm.$valid) {
                // check if is duplicated.
                var payment = PaymentService.createNew('creditcard');
                payment.data = angular.copy(newCreditCard);
                angular.extend(newCreditCard, emptyCheckTemplate);
            }
        };

        /**
         * Removes selected check from $scope.payments array
         * 
         * @param paymentId - payment id of the check to be removed.
         */
        $scope.removeCreditCard = function removeCheck(paymentId) {
            var payment = $filter('findBy')($scope.payments, 'id', paymentId);
            var index = $scope.payments.indexOf(payment);
            $scope.payments.splice(index, 1);
        };

    });
}(angular));