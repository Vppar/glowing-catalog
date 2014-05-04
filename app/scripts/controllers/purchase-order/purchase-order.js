(function (angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller(
        'PurchaseOrderCtrl',
        [
            '$scope',
            '$log',
            '$q',
            'ArrayUtils',
            'DialogService',
            'StockService',
            'PurchaseOrderService',
            'UserService',
            'NewPurchaseOrderService',
            function ($scope, $log, $q, ArrayUtils, DialogService, StockService, PurchaseOrderService, UserService, NewPurchaseOrderService) {

                UserService.redirectIfIsNotLoggedIn();

                // #####################################################################################################
                // Local variables
                // #####################################################################################################
                var purchaseOrderWatchedQty = {
                    firstExecution: true,
                    watcher: angular.noop
                };

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                function loadPurchaseOrders() {
                    $scope.ticket.purchaseOrders = NewPurchaseOrderService.list();
                }

                function loadStashedPurchaseOrder() {
                    if (!hasCurrentPurchaseOrder()) {
                        var stashedOrders = NewPurchaseOrderService.listStashed();
                        if (stashedOrders.length > 0) {
                            NewPurchaseOrderService.createNewCurrent(stashedOrders[0]);
                        } else {
                            NewPurchaseOrderService.createNewCurrent();
                        }
                    }
                }

                function hasCurrentPurchaseOrder() {
                    return NewPurchaseOrderService.purchaseOrder !== null && NewPurchaseOrderService.purchaseOrder.items.length > 0;
                }

                function updatePurchaseOrder(stockReport) {
                    var report = angular.copy(stockReport);
                    for (var ix in report.sessions) {
                        var session = report.sessions[ix];
                        for (var ix2 in session.lines) {
                            var line = session.lines[ix2];
                            for (var ix3 = 0; ix3 < line.items.length; ix3++) {
                                var item = line.items[ix3];
                                item.qty = $scope.purchaseOrder.watchedQty[item.id];
                                if (Number(item.qty) === 0) {
                                    NewPurchaseOrderService.purchaseOrder.remove(item);
                                } else {
                                    NewPurchaseOrderService.purchaseOrder.add(item);
                                }
                            }
                        }
                    }
                }

                function resetWatchedQty() {
                    for (var ix in $scope.main.stockReport.sessions) {
                        // sessions
                        var session = $scope.main.stockReport.sessions[ix];
                        // lines of that session
                        for (var ix2 in session.lines) {
                            // lines
                            var line = session.lines[ix2];
                            // items of that line
                            for (var ix3 in line.items) {
                                var item = line.items[ix3];
                                // backup items to use when a recalls is
                                // needed
                                $scope.purchaseOrder.items[item.id] = item;
                                $scope.purchaseOrder.watchedQty[item.id] = item.qty;
                            }
                        }
                    }
                }

                function enablePurchaseOrderWatchedQty() {
                    purchaseOrderWatchedQty.watcher = $scope.$watchCollection('purchaseOrder.watchedQty', function (newObj) {
                        if (purchaseOrderWatchedQty.firstExecution) {
                            purchaseOrderWatchedQty.firstExecution = false;
                        } else {
                            if (hasCurrentPurchaseOrder()) {
                                NewPurchaseOrderService.purchaseOrder.isDirty = true;
                            }

                            if ($scope.filter.text === '') {
                                $scope.summarizer(newObj, false);
                            } else {
                                $scope.summarizer(newObj, true);
                            }
                        }
                    });

                }

                function disablePurchaseOrderWatchedQty() {
                    purchaseOrderWatchedQty.watcher();
                    purchaseOrderWatchedQty.firstExecution = true;
                }

                /**
                 * Method to summarize the products from the list
                 *
                 * @param pickerArray - List with the value of the selector
                 *            from the html
                 *
                 * @param hide - boolean used to determine if the filter
                 *            will consider the hide attribute on the items.
                 *
                 */
                function summarizer(pickerArray, hide) {
                    var diff = {
                        amount: 0,
                        points: 0
                    };

                    $scope.summary.total.sessions = {};

                    for (var ix in pickerArray) {

                        // get the necessary values from the item
                        var price = $scope.purchaseOrder.items[ix].price;
                        var points = $scope.purchaseOrder.items[ix].points;
                        var session = $scope.purchaseOrder.items[ix].session;
                        var line = $scope.purchaseOrder.items[ix].line;
                        var minQty = $scope.purchaseOrder.items[ix].minQty;
                        var qty = pickerArray[ix];
                        var itemHide;

                        // if the method receives hide as true, then
                        // the
                        // itemHide will be the same as the hide
                        // property of the item, that way the items
                        // with
                        // hide = true won't be considered.
                        // Otherwise the itemHide receives false and
                        // all
                        // items will be considered.
                        if (hide === true) {
                            itemHide = $scope.purchaseOrder.items[ix].hide;
                        } else {
                            itemHide = false;
                        }

                        diff.amount += (pickerArray[ix] * price);
                        diff.points += (pickerArray[ix] * points);

                        // create the objects for the current
                        // session
                        // and line.
                        if (!$scope.summary.total.sessions[session]) {
                            $scope.summary.total.sessions[session] = {
                                total: 0,
                                minQty: 0,
                                orderQty: 0,
                                avg: 0,
                                pts: 0,
                                lines: {}
                            };
                        }
                        if (!$scope.summary.total.sessions[session].lines[line]) {
                            $scope.summary.total.sessions[session].lines[line] = {
                                total: 0,
                                minQty: 0,
                                orderQty: 0,
                                avg: 0,
                                pts: 0
                            };
                        }

                        // sum of the price per line and session
                        if ((pickerArray[ix] * price) > 0 && itemHide === false) {
                            $scope.summary.total.sessions[session].total += (pickerArray[ix] * price);
                            $scope.summary.total.sessions[session].lines[line].total += (pickerArray[ix] * price);
                        }
                        // sum of the minQty per line and session
                        if (minQty && itemHide === false) {
                            $scope.summary.total.sessions[session].minQty += minQty;
                            $scope.summary.total.sessions[session].lines[line].minQty += minQty;
                        }
                        // sum of the actual selected qty per line
                        // and
                        // session
                        if (qty > 0 && itemHide === false) {
                            $scope.summary.total.sessions[session].orderQty += qty;
                            $scope.summary.total.sessions[session].lines[line].orderQty += qty;
                        }
                        // sum of the points per line and session
                        if (qty > 0 && itemHide === false) {
                            $scope.summary.total.sessions[session].pts += (pickerArray[ix] * points);
                            $scope.summary.total.sessions[session].lines[line].pts += (pickerArray[ix] * points);
                        }
                    }

                    // the total overall
                    $scope.summary.total.amount = diff.amount;
                    $scope.summary.total.points = diff.points;

                    // calculate the average value.
                    for (var ix1 in $scope.summary.total.sessions) {
                        if ($scope.summary.total.sessions[ix1].orderQty > 0) {
                            $scope.summary.total.sessions[ix1].avg =
                                ($scope.summary.total.sessions[ix1].total) / ($scope.summary.total.sessions[ix1].orderQty);
                        }
                        for (var ix2 in $scope.summary.total.sessions[ix1].lines) {
                            if ($scope.summary.total.sessions[ix1].lines[ix2].orderQty > 0) {
                                $scope.summary.total.sessions[ix1].lines[ix2].avg =
                                    ($scope.summary.total.sessions[ix1].lines[ix2].total) /
                                    ($scope.summary.total.sessions[ix1].lines[ix2].orderQty);
                            }
                        }
                    }
                }

                function loadStockReportQty(stockReport, confirmed, partiallyReceived) {
                    var mapProductQty = {};

                    for (var ci in confirmed) {
                        var confirmedPurchaseOrder = confirmed[ci];
                        for (var ci2 in confirmedPurchaseOrder.items) {
                            var confirmedItem = confirmedPurchaseOrder.items[ci2];
                            if (mapProductQty[confirmedItem.id]) {
                                mapProductQty[confirmedItem.id] += Number(confirmedItem.qty);
                            } else {
                                mapProductQty[confirmedItem.id] = Number(confirmedItem.qty);
                            }
                        }
                    }

                    for (var pi in partiallyReceived) {
                        var partiallyReceivedPurchaseOrder = partiallyReceived[pi];
                        for (var pi2 in partiallyReceivedPurchaseOrder.items) {
                            var partiallyReceivedItem = partiallyReceivedPurchaseOrder.items[pi2];
                            var qtyReceived = ArrayUtils.find(partiallyReceived.itemReceived, 'id', partiallyReceivedItem.id);
                            var qtyBalance = partiallyReceivedItem.qty - qtyReceived;
                            if (qtyBalance > 0) {
                                if (mapProductQty[partiallyReceivedItem.id]) {
                                    mapProductQty[partiallyReceivedItem.id] += Number(partiallyReceivedItem.qty);
                                } else {
                                    mapProductQty[partiallyReceivedItem.id] = Number(partiallyReceivedItem.qty);
                                }
                            }
                        }
                    }

                    for (var ix in stockReport.sessions) {
                        var session = stockReport.sessions[ix];
                        for (var ix2 in session.lines) {
                            var line = session.lines[ix2];
                            for (var ix3 in line.items) {
                                var item = line.items[ix3];
                                var mappedQty = mapProductQty[item.id];
                                if (mappedQty) {
                                    if (item.minQty > mappedQty) {
                                        item.minQty = item.minQty - mappedQty;
                                        item.qty = item.minQty;
                                        $scope.purchaseOrder.watchedQty[item.id] = item.minQty;
                                    } else {
                                        delete item.minQty;
                                        item.qty = 0;
                                        $scope.purchaseOrder.watchedQty[item.id] = 0;
                                    }
                                    $scope.purchaseOrder.items[item.id] = item;
                                }
                            }
                        }
                    }
                }

                function resetPurchaseOrder() {
                    disablePurchaseOrderWatchedQty();

                    resetWatchedQty();

                    NewPurchaseOrderService.clearCurrent();

                    $scope.main.stockReport = StockService.stockReport('all');

                    loadStockReportQty($scope.main.stockReport, NewPurchaseOrderService.listConfirmed(), NewPurchaseOrderService.listPartiallyReceived());

                    NewPurchaseOrderService.createNewCurrent();
                    updatePurchaseOrder($scope.main.stockReport);

                    summarizer($scope.purchaseOrder.watchedQty, false);

                    enablePurchaseOrderWatchedQty();
                }

                // #####################################################################################################
                // Scope variables
                // #####################################################################################################
                /**
                 * Shared by all fragments
                 */
                $scope.main = {};
                $scope.main.stockReport = StockService.stockReport('all');
                $scope.tabs = {};
                $scope.tabs.selected = 'new';

                /**
                 * Summary tab
                 */
                $scope.summary = {};
                $scope.summary.total = {};
                $scope.summary.discount = {};
                $scope.summary.freight = {};
                $scope.summary.total.amount = 0;
                $scope.summary.total.amount2 = 0;
                $scope.summary.total.sessions = {};
                $scope.summary.total.amountWithDiscount = 0;
                $scope.summary.total.points = 0;
                $scope.summary.discount.fee = 0;
                $scope.summary.freight.amount = 0;

                /**
                 * New order tab
                 */
                $scope.purchaseOrder = {};
                $scope.purchaseOrder.items = {};
                $scope.purchaseOrder.watchedQty = {};
                $scope.filter = {
                    text: ''
                };

                /**
                 * Ticket tab
                 */
                $scope.ticket = {};
                $scope.ticket.watchedQty = {};
                $scope.ticket.checkBox = [];
                $scope.ticket.selectedPart = 'part1';
                $scope.ticket.purchaseOrders = [];

                /**
                 * Pending tab
                 */
                $scope.pending = {};

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################

                $scope.selectTab = function selectTab(tabName) {
                    $scope.tabs.selected = tabName;
                    $scope.ticket.selectedPart = 'part1';
                };

                $scope.isSummaryVisible = function (tabName) {
                    return tabName === 'new' || tabName === 'confirm';
                };

                $scope.financialRound = function financialRound(value) {
                    return (Math.round(100 * value) / 100);
                };


                $scope.resetPurchaseOrder = resetPurchaseOrder;
                $scope.hasCurrentPurchaseOrder = hasCurrentPurchaseOrder;
                $scope.enablePurchaseOrderWatchedQty = enablePurchaseOrderWatchedQty;
                $scope.disablePurchaseOrderWatchedQty = disablePurchaseOrderWatchedQty;
                $scope.loadStockReportQty = loadStockReportQty;
                $scope.updatePurchaseOrder = updatePurchaseOrder;
                $scope.summarizer = summarizer;

                // #####################################################################################################
                // Watchers
                // #####################################################################################################

                // $scope.$on('$destroy', function () {
                // updatePurchaseOrder($scope.main.stockReport);
                // if (hasCurrentPurchaseOrder()) {
                // NewPurchaseOrderService.saveCurrent();
                // }
                //                });

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################
                resetPurchaseOrder();
            }
        ]);
})(angular);
