(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.exchange', [
        'tnt.catalog.service.data', 'tnt.catalog.service.payment'
    ]).controller('PaymentExchangeCtrl', function($scope, $element, $filter, DataProvider, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing exchange data with a empty exchange
        var exchange = {};
        var emptyExchangeTemplate = {
            productId : null,
            amount : null
        };
        angular.extend(exchange, emptyExchangeTemplate);
        $scope.exchange = exchange;

        // Products informations to fill the screen combo.
        $scope.products = DataProvider.products;

        // Recovering dialogService from parent scope.
        var dialogService = $scope.dialogService;
        
        // #####################################################################################################
        // Scope action functions
        // #####################################################################################################

        /**
         * Adds a exchange payment to the last position of $scope.payments.
         * 
         * @param newExchange - the object containing the newExchange data.
         */
        $scope.addExchange = function(newExchange) {
            if (!newExchange.amount || newExchange.amount === 0) {
                return;
            }
            // check if the all mandatory fields are filed.
            if ($scope.exchangeForm.$valid) {
                // check if is duplicated.
                var payment = PaymentService.createNew('exchange');
                payment.amount = newExchange.amount;
                delete newExchange.amount;
                payment.data = angular.copy(newExchange);
                payment.data.productId = Number(payment.data.productId);
                newExchange.amount = payment.amount;
                $scope.exchangeForm.$pristine = true;
                $scope.exchangeForm.$dirty = false;
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            }
        };

        /**
         * Removes selected check from $scope.payments array
         * 
         * @param payment - check payment to be removed.
         */
        $scope.removeExchange = function removeExchange(payment) {
            var index = $scope.payments.indexOf(payment);
            $scope.payments.splice(index, 1);
        };

        $scope.setAmount = function setAmount(productId) {
            exchange.amount = $filter('findBy')(DataProvider.products, 'id', Number(productId)).price;
        };
        $scope.setAmount(1);

    });
}(angular));