(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.exchange', [
        'tnt.catalog.payment.service', 'tnt.catalog.inventory.keeper', 'tnt.utils.array', 'tnt.catalog.payment.entity'
    ]).controller('PaymentExchangeCtrl', function($scope, PaymentService, InventoryKeeper, ArrayUtils, DialogService, ExchangePayment) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        // Initializing exchange data with a empty exchange
        var products = InventoryKeeper.read();

        // Show Title or Title + Option(when possible).
        for ( var idx in products) {
            var item = products[idx];
            if (item.option) {
                item.uniqueName = item.title + ' - ' + item.option;
            } else {
                item.uniqueName = item.title;
            }
        }

        // Products informations to fill the screen combo.
        // $scope.products = DataProvider.products;

        $scope.products = products;
        $scope.id = 0;
        $scope.exchanges = [];

        $scope.amountTotal = 0;
        $scope.amount = 0;
        $scope.qtyTotal = 0;
        $scope.qtyItem = 0;
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
                var product = angular.copy(ArrayUtils.find(products, 'id', Number($scope.productId)));

                if (product) {
                    var exc = {};
                    exc.productId = product.id;
                    exc.title = product.title;
                    exc.option = product.option;
                    exc.price = $scope.amount;
                    exc.qty = $scope.qty;
                    exc.amount = $scope.amount * $scope.qty;

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
                title : 'Pagamento',
                message : 'Confirmar exclusão do item de troca?',
                btnYes : 'Sim',
                btnNo : 'Não'
            }).then(function(result) {
                if (result) {
                    var index = $scope.exchanges.indexOf(exch);
                    $scope.exchanges.splice(index, 1);
                    $scope.computeTotals();
                }
            });
        };

        // TODO - maybe change to compute totals on add/remove
        // action.
        // compute grid header
        $scope.computeTotals = function() {
            $scope.amountTotal = 0;
            $scope.qtyItem = $scope.exchanges.length;
            $scope.qtyTotal = 0;
            var index = 0;
            for ( var idx in $scope.exchanges) {
                var exchange = $scope.exchanges[idx];
                // rebuild the fake id.
                exchange.id = ++index;
                $scope.amountTotal += exchange.amount;
                $scope.qtyTotal += exchange.qty;
            }
        };

        $scope.confirmExchangePayments = function confirmExchangePayments() {
            PaymentService.clear('exchange');
            for ( var ix in $scope.exchanges) {
                var data = $scope.exchanges[ix];
                var payment = new ExchangePayment(data.id, data.productId, data.qty, data.price, data.amount);
                PaymentService.add(payment);
            }
            $scope.selectPaymentMethod('none');
        };

        // Set already included exchange payments
        $scope.exchanges = PaymentService.list('exchange');
        $scope.computeTotals();

    });
}(angular));
