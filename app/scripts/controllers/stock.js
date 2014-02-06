(function(angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('StockCtrl', function($scope, $filter, StockService) {

        var fullReservedListBkp = StockService.stockReport('reserved');
        var fullAvailableListBkp = StockService.stockReport('available');

        function buildList(objFilter) {
            var productsReserved = StockService.stockReport('reserved', objFilter);
            var productsAvailable = StockService.stockReport('available', objFilter);

            $scope.productsReserved = productsReserved;
            $scope.productsAvailable = productsAvailable;

            var overallQty = productsReserved.total.qty + productsAvailable.total.qty;
            var overallAmount = productsReserved.total.amount + productsAvailable.total.amount;
            var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

            $scope.overallProducts = {
                qty : overallQty,
                avgCost : overallAvgCost,
                amount : overallAmount
            };
        }

        $scope.productFilter = {
            dtInitial : $filter('date')(new Date().getTime()),
            text : ''
        };

        $scope.$watchCollection('productFilter', function() {
            var myTextFilter = $scope.productFilter.text;
            if (String(myTextFilter).length > 3) {
                var objFilter = {
                    title : myTextFilter,
                    SKU : myTextFilter
                };
                buildList(objFilter);
            } else {
                $scope.productsReserved = fullReservedListBkp;
                $scope.productsAvailable = fullAvailableListBkp;
            }
        });
    });
}(angular));