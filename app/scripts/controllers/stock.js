(function(angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('StockCtrl', function($scope, StockService) {

        var productsReserved = StockService.stockReport('reserved');
        var productsAvailable = StockService.stockReport('available');

        $scope.productsReserved = productsReserved;
        $scope.productsAvailable = productsAvailable;
        $scope.dtInitial = new Date();
        $scope.dtInitial.setHours(0);
        $scope.dtInitial.setMinutes(0);
        $scope.dtInitial.setSeconds(0);
        
        var overallQty = productsReserved.total.qty + productsAvailable.total.qty;
        var overallAmount = productsReserved.total.amount + productsAvailable.total.amount;
        var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

        $scope.overallProducts = {
            qty : overallQty,
            avgCost : overallAvgCost,
            amount : overallAmount
        };
    });
}(angular));