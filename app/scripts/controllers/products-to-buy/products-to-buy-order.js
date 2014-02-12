(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.order.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('ProductsToBuyOrderCtrl', function($scope, $log, StockService) {

        var items = {};
        $scope.selectedLevel = 3;
        
        $scope.watchedQty = {};

        $scope.productFilter = {
            text : ''
        };

        function resetWatchedQty() {
            for ( var ix in $scope.stockReport.sessions) {
                // sessions
                var session = $scope.stockReport.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        items[item.id] = item;
                        $scope.watchedQty[item.id] = item.qty;
                    }
                }
            }
        }
        resetWatchedQty();

        function updateReportQty() {
            for ( var ix in $scope.stockReport.sessions) {
                // sessions
                var session = $scope.stockReport.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        item.qty = $scope.watchedQty[item.id];
                    }
                }
            }
        }

        function setHideAttributes(sessions, hideLine, hideProduct) {
            for ( var ix in sessions) {
                var session = sessions[ix];
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

        $scope.clearFilter = function clearFilter() {
            $scope.productFilter.text = '';
        };

        $scope.showLevel = function showLevel(level) {
            $scope.productFilter.text = '';
            setTimeout(function() {
                $scope.selectedLevel = level;
                switch (level) {
                case 1:
                    setHideAttributes($scope.stockReport.sessions, true, true);
                    break;
                case 2:
                    setHideAttributes($scope.stockReport.sessions, false, true);
                    break;
                case 3:
                    setHideAttributes($scope.stockReport.sessions, false, false);
                    break;
                }
                $scope.$apply();
            }, 0);
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
        
        $scope.$watchCollection('watchedQty', function(newObj, oldObj) {
            var diff = {
                amount : 0,
                points : 0
            };

            for ( var ix in newObj) {
                var price = items[ix].price;
                var points = items[ix].points;

                diff.amount += (newObj[ix] * price);
                diff.points += (newObj[ix] * points);
            }

            updateReportQty();

            $scope.$emit('productQtyChange', diff);
        });

        $scope.$on('resetWatchedQty', function() {
            resetWatchedQty();
            $scope.productFilter.text = '';
        });

    });
}(angular));