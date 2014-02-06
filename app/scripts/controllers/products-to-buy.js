(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $filter, StockService) {

        $scope.productQty = {};

        var productsToBuy = StockService.stockReport('productsToBuy');

        $scope.productsToBuy = productsToBuy;

        for ( var session in productsToBuy) {
            for ( var line in productsToBuy[session]) {
                if (productsToBuy[session][line].items) {
                    for ( var ix in productsToBuy[session][line].items) {
                        var item = productsToBuy[session][line].items[ix];
                        $scope.productQty[item.id] = item.minQty;
                    }
                }
            }
        }
    });
}(angular));