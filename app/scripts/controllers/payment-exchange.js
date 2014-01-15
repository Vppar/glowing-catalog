(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.exchange', [
        'tnt.catalog.service.payment', 'tnt.catalog.inventory.keeper', 'tnt.utils.array'
    ]).controller('PaymentExchangeCtrl', function($scope, PaymentService, InventoryKeeper, ArrayUtils) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing exchange data with a empty exchange
        var products = InventoryKeeper.read();

        // Products informations to fill the screen combo.
        // $scope.products = DataProvider.products;

        $scope.products = products;
        $scope.index = 0;
        $scope.exchanges = [];

        $scope.amounttotal = 0;
        $scope.qtytotal = 0;
        $scope.amount = 0;
        $scope.qty = 1;

        // #####################################################################################################
        // Scope action functions
        // #####################################################################################################

        $scope.$watch('productId', function() {
            if ($scope.productId) {

                var product = ArrayUtils.find(products, 'id', Number($scope.productId));
                $scope.price = product.price;
                $scope.amount = $scope.price
                $scope.qty = 1;
            }
        });

        $scope.add = function add() {

            if ($scope.amount !== 0 && $scope.qty > 0) {
                var product = ArrayUtils.find(products, 'id', Number($scope.productId));

                if (product) {
                    var exc = {};
                    exc.amount = $scope.amount * $scope.qty;
                    exc.qty = $scope.qty;
                    exc.title = product.title;
                    exc.option = product.option;
                    $scope.index++;
                    exc.index = $scope.index;

                    $scope.exchanges.push(exc);

                    $scope.qtytotal = $scope.qtytotal + $scope.qty;
                    $scope.amounttotal = $scope.amounttotal + exc.amount;

                    $scope.price = 0;
                    $scope.amount = 0;
                    $scope.qty = 0;
                    $scope.productId = 0;
                }
            }

        };
    });
}(angular));