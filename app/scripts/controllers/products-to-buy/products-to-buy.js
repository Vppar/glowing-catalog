(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, StockService) {

        // Get a stock report to use as reference
        var stockReport = StockService.stockReport('all');

        // products
        for ( var ix in stockReport.sessions) {
            // sessions
            var session = stockReport.sessions[ix];
            // variables to session total and qty

            // lines of that session
            for ( var ix2 in session.lines) {
                // lines
                var line = session.lines[ix2];
                // items of that line
                for ( var ix3 in line.items) {
                    var item = line.items[ix3];
                    item.minQty = item.minQty === 0 ? '' : item.minQty;
                }
            }
        }

        // Publish in the products to buy "root" scope to be available to all
        // tabs
        $scope.stockReport = stockReport;

        $scope.selectTab = function selectTab(tabName) {
            $scope.selectedTab = tabName;
        };

        $scope.$on('cancel', function() {
            $scope.$broadcast('resetWatchedQty');
            $scope.selectedTab = 'buildOrder';
        });

        $scope.$on('confirm', function() {
            $scope.$broadcast('resetWatchedQty');
            $scope.selectedTab = 'buildOrder';
            // TODO - Save the order
        });

        $scope.$on('productQtyChange', function(event, args) {
            $scope.$broadcast('updateSummary', args);
        });
    });
}(angular));