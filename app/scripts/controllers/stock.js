(function(angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('StockCtrl', function($scope, $filter, StockService) {

        var productsReservedOri = StockService.stockReport('reserved');
        var productsAvailableOri = StockService.stockReport('available');

        $scope.productsReserved = angular.copy(productsReservedOri);
        $scope.productsAvailable = angular.copy(productsAvailableOri);

        var productsAvailable = $scope.productsAvailable;
        var productsReserved = $scope.productsReserved;

        var overallQty = productsReserved.total.qty + productsAvailable.total.qty;
        var overallAmount = productsReserved.total.amount + productsAvailable.total.amount;
        var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

        $scope.overallProducts = {
            qty : overallQty,
            avgCost : overallAvgCost,
            amount : overallAmount
        };

        $scope.$watch('filterProduct', function filterProducts(product) {
            if (product) {
                for ( var ix in $scope.productsAvailable.sessions) {
                    var session = $scope.productsAvailable.sessions[ix];
                    var session2 = productsAvailableOri.sessions[ix];
                    for ( var ix2 in session.lines) {
                        var line = session.lines[ix2];
                        var line2 = session2.lines[ix2];
                        line.items = $filter('filter')(line2.items, function(item) {
                            return (item.title.toUpperCase().indexOf(product.toUpperCase()) == -1) ? false : true;
                        });
                    }
                }
                for ( var ix in $scope.productsReserved.sessions) {
                    var session = $scope.productsReserved.sessions[ix];
                    var session2 = productsReservedOri.sessions[ix];
                    for ( var ix2 in session.lines) {
                        var line = session.lines[ix2];
                        var line2 = session2.lines[ix2];
                        line.items = $filter('filter')(line2.items, function(item) {
                            return (item.title.toUpperCase().indexOf(product.toUpperCase()) == -1) ? false : true;
                        });
                    }
                }
            } else {
                $scope.productsAvailable = angular.copy(productsAvailableOri);
                $scope.productsReserved = angular.copy(productsReservedOri);
            }
            updateTotals($scope.productsAvailable);
            updateTotals($scope.productsReserved);
            updateOverallTotals($scope.productsAvailable,$scope.productsReserved );
        });

        var updateTotals = function updateTotals(products) {
            products.total.qty = 0;
            products.total.amount = 0;
            for ( var ix in products.sessions) {
                var session = products.sessions[ix];
                session.total.amount = 0;
                session.total.qty = 0;
                for ( var ix2 in session.lines) {
                    var line = session.lines[ix2];
                    line.total.amount = 0;
                    line.total.qty = 0;
                    
                    for ( var ix3 in line.items) {
                        var product = line.items[ix3];
                        line.total.amount += currencyMultiply(product.qty, product.cost);
                        line.total.qty += product.qty;
                    }
                    line.total.avgCost = (currencyDivide(line.total.amount, line.total.qty));
                    session.total.amount += line.total.amount;
                    session.total.qty += line.total.qty;
                }
                session.total.avgCost = (currencyDivide(session.total.amount, session.total.qty));
                products.total.qty += session.total.qty;
                products.total.amount += session.total.amount;
            }
            products.total.avgCost = (currencyDivide(products.total.amount, products.total.qty));
        };
        
        var updateOverallTotals = function updateOverallTotals(products1, products2){
            $scope.overallProducts.qty = products1.total.qty + products2.total.qty;
            $scope.overallProducts.amount = products1.total.amount + products2.total.amount;
            $scope.overallProducts.avgCost = Math.round(100 * ($scope.overallProducts.amount / $scope.overallProducts.qty)) / 100;
        };

        var currencyMultiply = function currencyMultiply(value1, value2) {
            return Math.round(100 * (Number(value1) * Number(value2))) / 100;
        };
        var currencyDivide = function currencyMultiply(value1, value2) {
            var result = 0;
            if (value2 !== 0) {
                result = Math.round(100 * (Number(value1) / Number(value2))) / 100;
            }
            return result;
        };
    });
}(angular));