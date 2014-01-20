(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.exchange', [
        'tnt.catalog.payment.service', 'tnt.catalog.inventory.keeper', 'tnt.utils.array'
    ]).controller('PaymentExchangeCtrl', function($scope, PaymentService, InventoryKeeper, ArrayUtils, DialogService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing exchange data with a empty exchange
        var products = InventoryKeeper.read();

        //Show Title or Title + Option(when possible).
        for ( var idx in products) {
            var item = products[idx];
            if (item.option) {
                item.uniqueName = item.title + ' - ' + item.option;
            } else {
                item.uniqueName = item.title;
            }
        };

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
                $scope.amount = $scope.price;
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
                    exc.amountunit = $scope.amount;
                    exc.title = product.title;
                    exc.option = product.option;
                    $scope.index++;
                    exc.index = $scope.index;
                    exc.id = $scope.productId;
                    $scope.exchanges.push(exc);

                    $scope.price = 0;
                    $scope.amount = 0;
                    $scope.qty = 0;
                    $scope.productId = 0;
                }
                $scope.computeTotals();
            }

        };

        $scope.remove = function(exch) {
            DialogService.messageDialog({
                title : 'Atenção.',
                message : 'Confirmar exclusão do item de troca?',
                btnYes : 'Sim',
                btnNo : 'Não'
            }).then(function() {
                var index = $scope.exchanges.indexOf(exch);
                $scope.exchanges.splice(index, 1);
                $scope.computeTotals();
            });
            ;
        };

        // TODO - maybe change to compute totals on add/remove action.
        // compute grid header
        $scope.computeTotals = function() {
            $scope.amounttotal = 0;
            $scope.qtytotal = 0;
            $scope.id = $scope.exchanges.length;
            for ( var idx in $scope.exchanges) {
                $scope.amounttotal += $scope.exchanges[idx].amountunit * $scope.exchanges[idx].qty;
                $scope.qtytotal += $scope.exchanges[idx].qty;
            }
        };

    });
}(angular));
