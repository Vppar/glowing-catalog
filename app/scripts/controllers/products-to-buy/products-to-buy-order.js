(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.order.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyOrderCtrl', function($scope, $log, StockService) {

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        var stockReport = $scope.main.stockReport;
        var currentProductWatcher = {};

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        function setHideAttributes(sessions, hideLine, hideProduct) {
            for ( var ix in sessions) {
                var session = sessions[ix];
                session.hide = false;
                for ( var ix2 in session.lines) {
                    var line = session.lines[ix2];
                    line.hide = hideLine;
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        item.hide = hideProduct;
                    }
                }
            }
        }

        function productFilter(newVal, oldVal) {
            $scope.filter.text = newVal;
            if (newVal !== oldVal) {
                var myTextFilter = String($scope.productFilter.text);
                if (myTextFilter.length >= 3) {
                    $scope.selectedLevel = 3;
                    var objFilter = {
                        title : myTextFilter,
                        SKU : myTextFilter
                    };
                    StockService.updateReport(stockReport, objFilter);
                } else if (String(oldVal).length >= 3) {
                    StockService.updateReport(stockReport);
                }
            }
            
            if ($scope.productFilter.text === '') {
                $scope.summarizer($scope.purchaseOrder.watchedQty, false);
            } else {
                $scope.summarizer($scope.purchaseOrder.watchedQty, true);
            }
        }

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        $scope.selectedLevel = 1;

        $scope.productFilter = {
            text : ''
        };

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        $scope.clearFilter = function clearFilter() {
            $scope.productFilter.text = '';
        };

        $scope.toggleSession = function toggleSession(session) {
            if ($scope.productFilter.text === '') {
                for ( var ix in session.lines) {
                    var line = session.lines[ix];
                    line.hide = !line.hide;
                }
            } 
        };

        $scope.toggleLine = function toggleLine(line) {
            if ($scope.productFilter.text === '') {
                for ( var ix in line.items) {
                    var item = line.items[ix];
                    item.hide = !item.hide;
                }
            } 
        };

        $scope.showLevel = function showLevel(level) {
            // Disable watcher
            disableProductWatcher();
            // Clear filter
            $scope.clearFilter();
            // Enable watcher
            enableProductWatcher();

            switch (level) {
            case 1:
                setHideAttributes(stockReport.sessions, true, true);
                break;
            case 2:
                setHideAttributes(stockReport.sessions, false, true);
                break;
            case 3:
                setHideAttributes(stockReport.sessions, false, false);
                break;
            }

            $scope.selectedLevel = level;
        };
        // #####################################################################################################
        // Watchers
        // #####################################################################################################

        function enableProductWatcher() {
            currentProductWatcher = $scope.$watch('productFilter.text', productFilter);
        }

        function disableProductWatcher() {
            currentProductWatcher();
        }

        // #####################################################################################################
        // Controller warm up
        // #####################################################################################################

        // Enable watcher
        enableProductWatcher();
        $scope.showLevel(1);

    });

}(angular));