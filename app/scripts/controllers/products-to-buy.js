(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $filter, StockService) {

        $scope.productQty = [];
        $scope.productsToBuy = StockService.stockReport('productsToBuy');

    });
}(angular));