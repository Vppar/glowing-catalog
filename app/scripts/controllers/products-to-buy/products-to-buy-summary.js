(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.summary.ctrl', [
        'tnt.catalog.service.dialog'
    ]).controller('ProductsToBuySummaryCtrl', function($scope, DialogService) {

        $scope.orderTotal = 0;
        $scope.orderTotal2 = 0;
        $scope.discount = 0;
        $scope.freight = 0;
        $scope.orderTotalDiscount = 0;
        $scope.pointsTotal = 0;

        function calculateTotals(args) {
            $scope.orderTotal = args.amount;
            $scope.pointsTotal = args.points;

            calculateDiscount();
        }

        function calculateDiscount() {
            if ($scope.orderTotal >= 555 && $scope.orderTotal <= 889.99) {
                $scope.orderTotalDiscount = $scope.orderTotal * 0.75;
                $scope.discount = 25;
            } else if ($scope.orderTotal >= 890 && $scope.orderTotal <= 1409.99) {
                $scope.orderTotalDiscount = $scope.orderTotal * 0.70;
                $scope.discount = 30;
            } else if ($scope.orderTotal >= 1410 && $scope.orderTotal <= 2459.99) {
                $scope.orderTotalDiscount = $scope.orderTotal * 0.65;
                $scope.discount = 35;
            } else if ($scope.orderTotal >= 2460) {
                $scope.orderTotalDiscount = $scope.orderTotal * 0.60;
                $scope.discount = 40;
            } else {
                $scope.orderTotalDiscount = $scope.orderTotal;
                $scope.discount = 0;
            }
        }

        $scope.cancel = function() {
            console.log('cancel');
            var result = DialogService.messageDialog({
                title : 'Pedido de Compra',
                message : 'Cancelar o pedido de compra?',
                btnYes : 'Sim',
                btnNo : 'Não'
            });
            result.then(function(result) {
                if (result) {
                    $scope.$emit('cancel');
                }
            });
        };

        $scope.confirm = function() {
            console.log('confirm');
            var result = DialogService.messageDialog({
                title : 'Pedido de Compra',
                message : 'Confirmar o pedido de compra?',
                btnYes : 'Sim',
                btnNo : 'Não'
            });
            result.then(function(result) {
                if (result) {
                    $scope.$emit('confirm');
                }
            });
        };

        $scope.$on('updateSummary', function(event, args) {
            calculateTotals(args);
        });
    });
}(angular));