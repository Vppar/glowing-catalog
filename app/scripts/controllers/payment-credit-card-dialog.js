(function(angular){
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

    $scope.card ={};
    
    /**
     * @var creditCards - stores credit card list
     */
    $scope.creditCards = [];

    /**
     * Function addCreditCard - Adds credit card to the last position of $scope.creditCards array
     */
    $scope.addCreditCard = function(item) {
        if ($scope.creditCardForm.$valid) {
            if ($scope.card.value>0){
                    $scope.creditCards.push(angular.copy(item));                
            }            
        }
    };

    /**
     * Removes selected credit card from $scope.creditCards array
     * 
     * @param index - position of credit card to be removed
     */
    $scope.remove = function remove(index) {
        $scope.creditCards.splice(index, 1);
    };

    /**
     * Submits dialog
     */
    $scope.submitDialog = function() {
        dialog.close($scope.creditCards);
    };

    /**
     * Closes dialog
     */
    $scope.closeDialog = function() {
        dialog.close();
    };

});
}(angular));