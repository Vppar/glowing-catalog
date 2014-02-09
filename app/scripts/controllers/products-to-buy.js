(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $filter, StockService) {

        $scope.orderTotal = 0;
        $scope.orderTotal2 = 0;
        $scope.discount = 0;
        $scope.freight = 0;
        $scope.orderTotalDiscount = 0;
        $scope.pointsTotal = 0;

        $scope.sectionsTotal = {};
        $scope.watchedQty = {};

        var productsToBuy = StockService.stockReport('all');

        function calculateTotals() {
            $scope.orderTotal = 0;
            $scope.pointsTotal = 0;
            // products
            for ( var ix in productsToBuy.sessions) {
                // sessions
                var session = productsToBuy.sessions[ix];
                // variables to session total and qty
                var sessionTotal = 0;
                var sessionQty = 0;

                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];

                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        var qty = $scope.watchedQty[item.id];

                        item.minQty = item.minQty === 0 ? '' : item.minQty;

                        $scope.orderTotal += (qty * item.price);
                        sessionTotal += (qty * item.price);
                        sessionQty += qty;
                        $scope.pointsTotal += (item.points * qty);
                    }
                    // set the lines total, qty and avg
                    productsToBuy.sessions[ix].lines[ix2].total.amount = angular.copy(sessionTotal);
                    productsToBuy.sessions[ix].lines[ix2].total.qty = angular.copy(sessionQty);
                    productsToBuy.sessions[ix].lines[ix2].total.avgCost = ((sessionTotal) / (sessionQty));

                }
                // set the session total, qty and avg
                productsToBuy.sessions[ix].total.amount = angular.copy(sessionTotal);
                productsToBuy.sessions[ix].total.qty = angular.copy(sessionQty);
                productsToBuy.sessions[ix].total.avgCost = ((sessionTotal) / (sessionQty));
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

        function watchProductsQty() {
            for ( var ix in productsToBuy.sessions) {
                // sessions
                var session = productsToBuy.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        $scope.watchedQty[item.id] = item.qty;
                    }
                }
            }
        }

        watchProductsQty();
        calculateTotals();
        $scope.productsToBuy = productsToBuy;
        $scope.$watchCollection('watchedQty', calculateTotals);
    });
}(angular));