(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $filter, StockService) {

        var productsToBuy = StockService.stockReport('all');

        for ( var ix in productsToBuy.sessions) {
            var session = productsToBuy.sessions[ix];
            for ( var ix2 in session.lines) {
                var line = session.lines[ix2];
                for ( var ix3 in line.items) {
                    var item = line.items[ix3];
                    item.minQty = item.minQty === 0 ? '' : item.minQty;
                }
            }
        }

        $scope.productsToBuy = productsToBuy;
    });
}(angular));