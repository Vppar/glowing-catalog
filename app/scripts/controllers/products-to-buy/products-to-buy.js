(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $log, StockService) {

        // Get a stock report to use as reference
        var stockReportBkp = StockService.stockReport('all');
        $scope.stockReport = angular.copy(stockReportBkp);

        $scope.productFilter = {
            text : ''
        };

        $scope.clearFilter = function () {
            $scope.productFilter.text = '';
        };

        $scope.$watch('productFilter.text', function(newVal, oldVal) {
            var myTextFilter = $scope.productFilter.text;
            if (String(myTextFilter).length >= 3) {
                var objFilter = {
                    title : myTextFilter,
                    SKU : myTextFilter
                };
                StockService.updateReport($scope.stockReport, objFilter);
            } else {
                StockService.updateReport($scope.stockReport);
            }
        });

        $scope.selectTab = function selectTab(tabName) {
            $scope.selectedTab = tabName;
        };

        $scope.summaryIsVisible = function (tabName) {
            return tabName === 'buildOrder' || tabName === 'confirmOrder';
        };

        $scope.$on('cancel', function() {

            $scope.productFilter.text = '';
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));

            updateReport($scope.stockReport);

            $scope.selectedTab = 'buildOrder';

            $scope.$broadcast('resetWatchedQty');
        });

        $scope.$on('confirm', function() {
            $scope.productFilter.text = '';
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));

            StockService.updateReport($scope.stockReport);

            $scope.selectedTab = 'verifyTicket';

            $scope.$broadcast('resetWatchedQty');
            // TODO - Save the order
        });

        $scope.$on('productQtyChange', function(event, args) {
            $scope.$broadcast('updateSummary', args);
            $scope.$broadcast('updateConfirmed', args);
        });
    });
}(angular));
