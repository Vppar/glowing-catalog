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

        $scope.$on('cancel', function() {
            var updatedBkpCopy = StockService.updateReport(angular.copy(stockReportBkp));
            angular.extend($scope.stockReport, updatedBkpCopy);

            $scope.productFilter.text = '';

            updateReport($scope.stockReport);

            $scope.selectedTab = 'buildOrder';

            $scope.$broadcast('resetWatchedQty');
        });

        $scope.$on('confirm', function() {
            var updatedBkpCopy = StockService.updateReport(angular.copy(stockReportBkp));
            angular.extend($scope.stockReport, updatedBkpCopy);

            $scope.productFilter.text = '';

            $scope.selectedTab = 'verifyTicket';

            $scope.$broadcast('resetWatchedQty');
            $scope.$broadcast('updatePuchaseOrders');
        });

        $scope.$on('productQtyChange', function(event, args) {
            $scope.$broadcast('updateSummary', args);
            $scope.$broadcast('updateConfirmed', args);
        });
    });
}(angular));
