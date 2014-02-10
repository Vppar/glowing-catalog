(function(angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('StockCtrl', function($scope, $filter, StockService) {

        var fullReservedListBkp = StockService.stockReport('reserved');
        var fullAvailableListBkp = StockService.stockReport('available');

        function buildList(productsReserved, productsAvailable, objFilter) {
            $scope.productsReserved = productsReserved;
            $scope.productsAvailable = productsAvailable;

            var overallQty = productsReserved.total.qty + productsAvailable.total.qty;
            var overallAmount = productsReserved.total.amount + productsAvailable.total.amount;
            var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

            $scope.overallProducts.qty = overallQty;
            $scope.overallProducts.avgCost = overallAvgCost;
            $scope.overallProducts.amount = overallAmount;
        }

        $scope.overallProducts = {
            qty : 0,
            avgCost : 0,
            amount : 0
        };

        $scope.productFilter = {
            dtInitial : $filter('date')(new Date().getTime()),
            text : ''
        };

        $scope.$watchCollection('productFilter', function() {
            var myTextFilter = $scope.productFilter.text;
            if (String(myTextFilter).length >= 3) {
                var objFilter = {
                    title : myTextFilter,
                    SKU : myTextFilter
                };
                var reserved = StockService.stockReport('reserved', objFilter);
                var available = StockService.stockReport('available', objFilter);
                buildList(reserved, available, objFilter);
            } else {
                buildList(fullReservedListBkp, fullAvailableListBkp);
            }
        });
    });
}(angular));