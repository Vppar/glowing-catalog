(function(angular) {
    'use strict';

    /**
     * PaymentCreditCardDialogCtrl controller
     * 
     * Controls credit card list
     * 
     * @author Fillipe
     * 
     */
    angular.module('glowingCatalogApp').controller('PaymentCreditCardDialogCtrl', function($scope, dialog, DataProvider) {

        /**
         * @var dataProvider - receives data from DataProvider (DataProvider.js)
         */
        $scope.dataProvider = DataProvider;

        $scope.creditCard = {};
        $scope.card = {
            value : 0
        };
        $scope.payments = angular.copy(dialog.data.payments);

        function watchChecks() {
            $scope.payments.creditCardsTotal = 0;
            for ( var i = 0; i < $scope.payments.creditCards.length; i++) {
                $scope.payments.creditCardsTotal += Number($scope.payments.creditCards[i].value);
            }
            $scope.payments.total = $scope.payments.creditCardsTotal + $scope.payments.checksTotal;
        }
        $scope.$watch('payments', watchChecks, true);

        /**
         * Function addCreditCard - Adds credit card to the last position of
         * $scope.creditCards array
         */
        $scope.addCreditCard = function(item) {
            if ($scope.creditCardForm.$valid) {
                if ($scope.card.value > 0) {
                    $scope.payments.creditCards.push(angular.copy(item));
                }
            }
        };

        /**
         * Removes selected credit card from $scope.creditCards array
         * 
         * @param index - position of credit card to be removed
         */
        $scope.remove = function remove(index) {
            $scope.payments.creditCards.splice(index, 1);
        };

        /**
         * Submits dialog
         */
        $scope.submitDialog = function() {
            dialog.close($scope.payments);
        };

        /**
         * Closes dialog
         */
        $scope.closeDialog = function() {
            dialog.close();
        };

    });
}(angular));