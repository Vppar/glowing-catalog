(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.exchange', [
        'tnt.catalog.service.data', 'tnt.catalog.service.payment','tnt.catalog.inventory.keeper', 
        'tnt.utils.array'
    ]).controller('PaymentExchangeCtrl', function($scope, $element, $filter, DataProvider, PaymentService, InventoryKeeper, ArrayUtils) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing exchange data with a empty exchange
        var exchange = {};
        var emptyExchangeTemplate = {
            productId : null,
            amount : null
        };
        
        
        
        var products = InventoryKeeper.read();
        
        angular.extend(exchange, emptyExchangeTemplate);
        $scope.exchange = exchange;

        // Products informations to fill the screen combo.
        //$scope.products = DataProvider.products;
        $scope.products = products;
        $scope.check = exchange;

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
            if (productId) {
                var product = ArrayUtils.find(products, 'id', Number(productId));
                exchange.amount = product.price;
            } else {
                exchange.amount = 0;
            }
        };
        $scope.setAmount();

    });
}(angular));