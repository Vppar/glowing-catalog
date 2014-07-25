(function (angular) {
    'use strict';
    angular.module('tnt.catalog.stock.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.purchaseOrder.service', 'tnt.catalog.user'
    ]).controller(
        'StockCtrl',
        [
            '$scope',
            '$filter',
            'StockService',
            'PurchaseOrderService',
            'UserService',
            function ($scope, $filter, StockService, PurchaseOrderService, UserService) {

                UserService.redirectIfInvalidUser();

                // #####################################################################################################
                // Local Variables
                // #####################################################################################################

                var currentProductWatcher = {};

                var fullReservedListBkp = StockService.reportReserved();
                var fullAvailableListBkp = StockService.reportAvailable();
                var fullPendingListBkp = PurchaseOrderService.reportPending();

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                function buildList (productsAvailable, productsReserved, productsPending) {
                    $scope.productsReserved = productsReserved;
                    $scope.productsAvailable = productsAvailable;
                    $scope.productsPending = productsPending;

                    var overallQty =
                        productsReserved.total.qty + productsAvailable.total.qty +
                            productsPending.total.qty;
                    var overallAmount =
                        productsReserved.total.amount + productsAvailable.total.amount +
                            productsPending.total.amount;
                    var overallAvgCost = Math.round(100 * (overallAmount / overallQty)) / 100;

                    $scope.overallProducts.qty = overallQty;
                    $scope.overallProducts.avgCost = overallAvgCost;
                    $scope.overallProducts.amount = overallAmount;
                }

                function setHideAttributes (sessions, hideLine, hideProduct) {
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

                var productFilter =
                    function productFilter (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            var myTextFilter = String($scope.productFilter.text);
                            if (myTextFilter.length >= 3) {
                                $scope.selectedLevel = 4;
                                var objFilter = {
                                    title : myTextFilter,
                                    SKU : myTextFilter
                                };

                                var available = StockService.reportAvailable(objFilter);
                                var reserved = StockService.reportReserved(objFilter);
                                var pending = PurchaseOrderService.reportPending(objFilter);

                                buildList(available, reserved, pending, objFilter);

                            } else if (String(oldVal).length >= 3) {
                                buildList(
                                    fullAvailableListBkp,
                                    fullReservedListBkp,
                                    fullPendingListBkp);

                                $scope.showLevel($scope.selectedLevel);
                            }
                        }
                    };

                var hideAllSections = function hideAllSections (sessions) {
                    for ( var ix in sessions) {
                        var session = sessions[ix];
                        session.hide = true;
                    }
                };

                // #####################################################################################################
                // Scope variables
                // #####################################################################################################

                $scope.selectedLevel = 0;

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

                $scope.clearFilter = function clearFilter () {
                    $scope.productFilter.text = '';
                };

                $scope.showLevel = function showLevel (level) {
                    switch (level) {
                        case 1:
                            setHideAttributes($scope.productsAvailable.sessions, true, true);
                            setHideAttributes($scope.productsReserved.sessions, true, true);
                            setHideAttributes($scope.productsPending.sessions, true, true);
                            hideAllSections($scope.productsAvailable.sessions);
                            hideAllSections($scope.productsReserved.sessions);
                            hideAllSections($scope.productsPending.sessions);
                            break;
                        case 2:
                            setHideAttributes($scope.productsAvailable.sessions, true, true);
                            setHideAttributes($scope.productsReserved.sessions, true, true);
                            setHideAttributes($scope.productsPending.sessions, true, true);
                            break;
                        case 3:
                            setHideAttributes($scope.productsAvailable.sessions, false, true);
                            setHideAttributes($scope.productsReserved.sessions, false, true);
                            setHideAttributes($scope.productsPending.sessions, false, true);
                            break;
                        case 4:
                            setHideAttributes($scope.productsAvailable.sessions, false, false);
                            setHideAttributes($scope.productsReserved.sessions, false, false);
                            setHideAttributes($scope.productsPending.sessions, false, false);
                            break;
                    }

                    $scope.selectedLevel = level;
                };

                $scope.toggleAllSections = function toggleAllSections (sessions) {
                    for ( var ix in sessions) {
                        var session = sessions[ix];
                        session.hide = !session.hide;
                    }
                };

                $scope.toggleSession = function toggleSession (session) {
                    for ( var ix in session.lines) {
                        var line = session.lines[ix];
                        line.hide = !line.hide;
                    }
                };

                $scope.toggleLine = function toggleLine (line) {
                    for ( var ix in line.items) {
                        var item = line.items[ix];
                        item.hide = !item.hide;
                    }
                };

                // #####################################################################################################
                // Watchers
                // #####################################################################################################

                function enableProductWatcher () {
                    currentProductWatcher = $scope.$watch('productFilter.text', productFilter);
                }

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################

                buildList(fullAvailableListBkp, fullReservedListBkp, fullPendingListBkp);

                // Enable watcher
                enableProductWatcher();

                $scope.showLevel(1);
            }
        ]);
})(angular);