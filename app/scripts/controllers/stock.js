(function(angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service'
    ]).controller('StockCtrl', function($scope, $filter, StockService) {

        // #####################################################################################################
        // Local Variables
        // #####################################################################################################

        var currentProductWatcher = {};
        var fullReservedListBkp = StockService.stockReport('reserved');
        var fullAvailableListBkp = StockService.stockReport('available');

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        function buildList(productsReserved, productsAvailable, objFilter) {
            $scope.productsReserved = productsReserved;
            $scope.productsAvailable = productsAvailable;

            var overallQty = productsReserved.total.qty + productsAvailable.total.qty;
            var overallAmount = productsReserved.total.amount + productsAvailable.total.amount;
            var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

            $scope.overallProducts.qty = overallQty;
            $scope.overallProducts.avgCost = overallAvgCost;
            $scope.overallProducts.amount = overallAmount;
        }

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

        var productFilter = function productFilter(newVal, oldVal) {
            if (newVal !== oldVal) {
                var myTextFilter = String($scope.productFilter.text);
                if (myTextFilter.length >= 3) {
                    $scope.selectedLevel = 3;
                    var objFilter = {
                        title : myTextFilter,
                        SKU : myTextFilter
                    };
                    var reserved = StockService.stockReport('reserved', objFilter);
                    var available = StockService.stockReport('available', objFilter);
                    buildList(reserved, available, objFilter);
                } else if (String(oldVal).length >= 3) {
                    buildList(fullReservedListBkp, fullAvailableListBkp);
                    $scope.showLevel($scope.selectedLevel);
                }
            }
        };

        var hideAllSections = function hideAllSections(sessions) {
            for ( var ix in sessions) {
                var session = sessions[ix];
                session.hide = true;
            }
        };

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        $scope.selectedLevel = 1;

        $scope.overallProducts = {
            qty : 0,
            avgCost : 0,
            amount : 0
        };

        $scope.productFilter = {
            dtInitial : $filter('date')(new Date().getTime()),
            text : ''
        };

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        $scope.clearFilter = function clearFilter() {
            $scope.productFilter.text = '';
        };

        $scope.showLevel = function showLevel(level) {
            switch (level) {
            case 1:
                hideAllSections($scope.productsAvailable.sessions);
                hideAllSections($scope.productsReserved.sessions);
                break;
            case 2:
                setHideAttributes($scope.productsAvailable.sessions, false, true);
                setHideAttributes($scope.productsReserved.sessions, false, true);
                break;
            case 3:
                setHideAttributes($scope.productsAvailable.sessions, false, false);
                setHideAttributes($scope.productsReserved.sessions, false, false);
                break;
            }

            $scope.selectedLevel = level;
        };

        $scope.toggleAllSections = function toggleAllSections(sessions, force) {
            for ( var ix in sessions) {
                var session = sessions[ix];
                session.hide = !session.hide;
            }
        };

        $scope.toggleSession = function toggleSession(session) {
            for ( var ix in session.lines) {
                var line = session.lines[ix];
                line.hide = !line.hide;
            }
        };

        $scope.toggleLine = function toggleLine(line) {
            for ( var ix in line.items) {
                var item = line.items[ix];
                item.hide = !item.hide;
            }
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

        buildList(fullReservedListBkp, fullAvailableListBkp);

        // Enable watcher
        enableProductWatcher();

        $scope.showLevel(1);
    });
}(angular));