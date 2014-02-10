(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.summary.ctrl', []).controller('ProductsToBuySummaryCtrl', function($scope) {

        var productsToBuy = $scope.productsToBuy;

        $scope.orderTotal = 0;
        $scope.orderTotal2 = 0;
        $scope.discount = 0;
        $scope.freight = 0;
        $scope.orderTotalDiscount = 0;
        $scope.pointsTotal = 0;

        function calculateTotals(watchedQty) {
            $scope.orderTotal = 0;
            $scope.pointsTotal = 0;

            // products
            for ( var ix in productsToBuy.sessions) {
                // sessions
                var session = productsToBuy.sessions[ix];
                // variables to session total and qty

                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];

                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        var qty = watchedQty[item.id];

                        $scope.orderTotal += (qty * item.price);
                        $scope.pointsTotal += (item.points * qty);
                    }
                }
            }
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

        $scope.$on('updateSummary', function(event, args) {
            calculateTotals(args);
        });
    });
}(angular));