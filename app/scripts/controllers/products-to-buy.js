(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, StockService) {

        $scope.productsToBuy = [
            {}, {}, {}
        ];
    });
}(angular));