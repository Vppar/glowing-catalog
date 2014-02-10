(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $log,  StockService) {

        // Get a stock report to use as reference
        var stockReportBkp = StockService.stockReport('all');
        
        $scope.stockReport = angular.copy(stockReportBkp);

        function updateReport(stockReport, filter) {
            // products
            for ( var ix in stockReport.sessions) {
                // sessions
                var session = stockReport.sessions[ix];
                // variables to session total and qty
                var lineCount = 0;
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    var itemCount = 0;
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        item.minQty = item.minQty === 0 ? '' : item.minQty;
                        item.hide = true;
                        if (angular.isObject(filter)) {
                            for ( var ix in filter) {
                                if (item[ix]) {
                                    var property = String(item[ix]).toLowerCase();
                                    var myFilter = String(filter[ix]).toLowerCase();
                                    if (property.indexOf(myFilter) > -1) {
                                        item.hide = false;
                                        itemCount++;
                                        break;
                                    }
                                }
                            }
                        } else {
                            itemCount++;
                            item.hide = false;
                        }
                    }

                    if (itemCount === 0) {
                        line.hide = true;
                    } else {
                        line.hide = false;
                        lineCount++;
                    }
                }
                if (lineCount === 0) {
                    session.hide = true;
                } else {
                    session.hide = false;
                }
            }
        }

        $scope.productFilter = {
            text : ''
        };

        $scope.$watch('productFilter.text', function(newVal, oldVal) {
            var myTextFilter = $scope.productFilter.text;
            if (String(myTextFilter).length >= 3) {
                var objFilter = {
                    title : myTextFilter,
                    SKU : myTextFilter
                };
                updateReport($scope.stockReport, objFilter);
            } else {
                updateReport($scope.stockReport);
            }
        });

        $scope.selectTab = function selectTab(tabName) {
            $scope.selectedTab = tabName;
        };

        $scope.$on('cancel', function() {
            var processStarted = new Date().getTime();

            $scope.productFilter.text = '';
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));
            
            updateReport($scope.stockReport);

            $scope.selectedTab = 'buildOrder';
            
            var processDone = new Date().getTime();
            $log.debug('ProductsToBuyCtrl.on(cancel): -It took ' + (processDone - processStarted) +
                'ms to create the stockReport.');

            $scope.$broadcast('resetWatchedQty');
        });

        $scope.$on('confirm', function() {
            var processStarted = new Date().getTime();
            
            $scope.productFilter.text = '';
            angular.extend($scope.stockReport, angular.copy(stockReportBkp));
            
            updateReport($scope.stockReport);

            $scope.selectedTab = 'verifyTicket';
            
            var processDone = new Date().getTime();
            $log.debug('ProductsToBuyCtrl.on(confirm): -It took ' + (processDone - processStarted) +
                'ms to confirm the purchase order.');

            $scope.$broadcast('resetWatchedQty');
            // TODO - Save the order
        });

        $scope.$on('productQtyChange', function(event, args) {
            $scope.$broadcast('updateSummary', args);
            $scope.$broadcast('updateConfirmed', args);
        });
    });
}(angular));