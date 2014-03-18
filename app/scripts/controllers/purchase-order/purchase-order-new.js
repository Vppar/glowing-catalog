(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.new.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.purchase.service'
    ]).controller('PurchaseOrderNewCtrl', [
        '$scope', '$log', 'StockService', 'NewPurchaseOrderService', function($scope, $log, StockService, NewPurchaseOrderService) {

            // #####################################################################################################
            // Local Functions
            // #####################################################################################################

            var stockReport = $scope.main.stockReport;
            var currentProductWatcher = {};
            var purchaseOrder = NewPurchaseOrderService.purchaseOrder;

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

            function reviewMinQty(stockReport, confirmed, partiallyReceived) {
                var mapProcuctQty = {};

                for ( var ci in confirmed) {
                    var confirmedPurchaseOrder = confirmed[ci];
                    for ( var ci2 in confirmedPurchaseOrder.items) {
                        var item = confirmedPurchaseOrder.items[ci2];
                        if (mapProcuctQty[item.id]) {
                            mapProcuctQty[item.id] += Number(item.qty);
                        } else {
                            mapProcuctQty[item.id] = Number(item.qty);
                        }
                    }
                }

                for ( var pi in partiallyReceived) {
                    var partiallyReceivedPurchaseOrder = partiallyReceived[pi];
                    for ( var pi2 in partiallyReceivedPurchaseOrder.items) {
                        var item = partiallyReceivedPurchaseOrder.items[pi2];
                        var qtyReceived = ArrayUtils.find(partiallyReceived.itemReceived, 'id', item.id);
                        var qtyBalance = item.qty - qtyReceived;
                        if (qtyBalance > 0) {
                            if (mapProcuctQty[item.id]) {
                                mapProcuctQty[item.id] += Number(item.qty);
                            } else {
                                mapProcuctQty[item.id] = Number(item.qty);
                            }
                        }
                    }
                }

                for ( var ix in stockReport.sessions) {
                    var session = stockReport.sessions[ix];
                    for ( var ix2 in session.lines) {
                        var line = session.lines[ix2];
                        for ( var ix3 in line.items) {
                            var item = line.items[ix3];
                            var mappedQty = mapProcuctQty[item.id];
                            if (mappedQty) {
                                if (item.minQty > mappedQty) {
                                    item.minQty = item.minQty - mappedQty;
                                    item.qty = item.minQty;
                                    $scope.purchaseOrder.watchedQty[item.id] = item.minQty;
                                } else {
                                    item.minQty = 0;
                                    item.qty = 0;
                                    $scope.purchaseOrder.watchedQty[item.id] = 0;
                                }
                            }
                        }
                    }
                }
            }

            function loadStashedPurchaseOrder(stockReport, purchaseOrder) {
                if (purchaseOrder.uuid) {
                    var mapQty = {};
                    for ( var i in purchaseOrder.items) {
                        var item = NewPurchaseOrderService.purchaseOrder.items[i];
                        mapQty[item.id] = item.qty;
                    }

                    for ( var ix in stockReport.sessions) {
                        var session = stockReport.sessions[ix];
                        for ( var ix2 in session.lines) {
                            var line = session.lines[ix2];
                            for ( var ix3 in line.items) {
                                var item = line.items[ix3];
                                var qty = mapQty[item.id];

                                item.qty = qty ? qty : 0;
                                $scope.purchaseOrder.watchedQty[item.id] = qty ? qty : 0;
                            }
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
            reviewMinQty(stockReport, NewPurchaseOrderService.listConfirmed(), NewPurchaseOrderService.listPartiallyReceived());
            loadStashedPurchaseOrder(stockReport, purchaseOrder);
            $scope.showLevel(1);
        }
    ]);

})(angular);