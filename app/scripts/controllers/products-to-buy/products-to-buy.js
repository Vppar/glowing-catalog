(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $log, StockService) {

        // Get a stock report to use as reference
        var stockReportBkp = StockService.stockReport('all');

        $scope.stockReport = angular.copy(stockReportBkp);

        $scope.summary = {};
        $scope.summary.orderTotal = 0;
        $scope.summary.orderDiscount = 0;
        $scope.summary.orderPoints = 0;

        $scope.selectTab = function selectTab(tabName) {
            $scope.selectedTab = tabName;
        };

        $scope.summaryIsVisible = function(tabName) {
            return tabName === 'buildOrder' || tabName === 'confirmOrder';
        };

        $scope.$on('productQtyChange', function(event, args) {
            $scope.$broadcast('updateSummary', args);
        });

        $scope.$on('summaryUpdated', function(event, args) {
            $scope.$broadcast('updatedPurchaseOrder', args);
        });

        $scope.$on('cancelPurchaseOrder', function() {
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));
            StockService.updateReport($scope.stockReport);

            $scope.selectedTab = 'buildOrder';

            $scope.$broadcast('resetWatchedQty');
        });

        $scope.$on('confirmPurchaseOrder', function() {
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));
            StockService.updateReport($scope.stockReport);

            $scope.$broadcast('resetWatchedQty');
            $scope.$broadcast('newPurchaseOrder');
        });
    });
}(angular));
