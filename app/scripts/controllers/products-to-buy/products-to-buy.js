(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller(
            'ProductsToBuyCtrl',
            function($scope, $log, ArrayUtils, StockService, PurchaseOrderService, UserService) {

                UserService.redirectIfIsNotLoggedIn();

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                function resetWatchedQty() {
                    for ( var ix in $scope.main.stockReport.sessions) {
                        // sessions
                        var session = $scope.main.stockReport.sessions[ix];
                        // lines of that session
                        for ( var ix2 in session.lines) {
                            // lines
                            var line = session.lines[ix2];
                            // items of that line
                            for ( var ix3 in line.items) {
                                var item = line.items[ix3];
                                // backup items to use when a recals is needed
                                $scope.purchaseOrder.items[item.id] = item;
                                $scope.purchaseOrder.watchedQty[item.id] = item.qty;
                            }
                        }
                    }
                }

                function loadPurchaseOrders() {
                    $scope.ticket.purchaseOrders = PurchaseOrderService.list();
                }

                $scope.summarizer =
                        function(newObj, hide) {
                            var diff = {
                                amount : 0,
                                points : 0
                            };

                            $scope.summary.total.sessions = {};
                            $scope.summary.total.lines = {};

                            for ( var ix in newObj) {

                                var price = $scope.purchaseOrder.items[ix].price;
                                var points = $scope.purchaseOrder.items[ix].points;
                                var session = $scope.purchaseOrder.items[ix].session;
                                var line = $scope.purchaseOrder.items[ix].line;
                                var minQty = $scope.purchaseOrder.items[ix].minQty;
                                var qty = newObj[ix];
                                var itemHide;
                                if (hide === true) {
                                    itemHide = $scope.purchaseOrder.items[ix].hide;
                                } else {
                                    itemHide = false;
                                }
                                diff.amount += (newObj[ix] * price);
                                diff.points += (newObj[ix] * points);

                                if (!$scope.summary.total.sessions[session]) {
                                    $scope.summary.total.sessions[session] = {
                                        total : 0,
                                        minQty : 0,
                                        orderQty : 0,
                                        avg : 0,
                                        lines : {}
                                    };
                                }
                                if (!$scope.summary.total.sessions[session].lines[line]) {
                                    $scope.summary.total.sessions[session].lines[line] = {
                                        total : 0,
                                        minQty : 0,
                                        orderQty : 0,
                                        avg : 0
                                    };
                                }

                                if ((newObj[ix] * price) > 0 && itemHide === false) {
                                    $scope.summary.total.sessions[session].total += (newObj[ix] * price);
                                    $scope.summary.total.sessions[session].lines[line].total += (newObj[ix] * price);
                                }
                                if (minQty && itemHide === false) {
                                    $scope.summary.total.sessions[session].minQty += minQty;
                                    $scope.summary.total.sessions[session].lines[line].minQty += minQty;
                                }
                                if (qty > 0 && itemHide === false) {
                                    $scope.summary.total.sessions[session].orderQty += qty;
                                    $scope.summary.total.sessions[session].lines[line].orderQty += qty;
                                }
                            }

                            $scope.summary.total.amount = diff.amount;
                            $scope.summary.total.points = diff.points;

                            for ( var ix in $scope.summary.total.sessions) {
                                if ($scope.summary.total.sessions[ix].orderQty > 0) {
                                    $scope.summary.total.sessions[ix].avg =
                                            ($scope.summary.total.sessions[ix].total) / ($scope.summary.total.sessions[ix].orderQty);
                                }
                                for ( var ix2 in $scope.summary.total.sessions[ix].lines) {
                                    if ($scope.summary.total.sessions[ix].lines[ix2].orderQty > 0) {
                                        $scope.summary.total.sessions[ix].lines[ix2].avg =
                                                ($scope.summary.total.sessions[ix].lines[ix2].total) /
                                                    ($scope.summary.total.sessions[ix].lines[ix2].orderQty);
                                    }
                                }
                            }
                        };

                // #####################################################################################################
                // Scope variables
                // #####################################################################################################
                /**
                 * Shared by all fragments
                 */
                $scope.main = {};
                $scope.main.stockReport = StockService.stockReport('all');
                $scope.tabs = {};
                $scope.tabs.selected = 'buildOrder';

                /**
                 * Summary tab
                 */
                $scope.summary = {};
                $scope.summary.total = {};
                $scope.summary.discount = {};
                $scope.summary.freight = {};
                $scope.summary.total.amount = 0;
                $scope.summary.total.lines = {};
                $scope.summary.total.amount2 = 0;
                $scope.summary.total.sessions = {};
                $scope.summary.total.amountWithDiscount = 0;
                $scope.summary.total.points = 0;
                $scope.summary.discount.fee = 0;
                $scope.summary.freight.amount = 0;

                /**
                 * Order tab
                 */
                $scope.purchaseOrder = {};
                $scope.purchaseOrder.items = {};
                $scope.purchaseOrder.watchedQty = {};
                $scope.filter = {
                    text : ''
                };

                /**
                 * Ticket tab
                 */
                $scope.ticket = {};
                $scope.ticket.watchedQty = {};
                $scope.ticket.checkBox = [];
                $scope.ticket.selectedPart = 'part1';
                $scope.ticket.loadPurchaseOrders = loadPurchaseOrders;
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

                $scope.summaryIsVisible = function(tabName) {
                    return tabName === 'buildOrder' || tabName === 'confirmOrder';
                };

                $scope.financialRound = function financialRound(value) {
                    return (Math.round(100 * value) / 100);
                };

                $scope.resetPurchaseOrder = function resetPurchaseOrder() {
                    setTimeout(function() {
                        $scope.main.stockReport = StockService.stockReport('all');
                        StockService.updateReport($scope.main.stockReport);
                        resetWatchedQty();
                    }, 0);
                };

                // #####################################################################################################
                // Watchers
                // #####################################################################################################

                $scope.$watchCollection('purchaseOrder.watchedQty', function(newObj, oldObj) {
                    if ($scope.filter.text === '') {
                        $scope.summarizer(newObj, false);
                    } else {
                        $scope.summarizer(newObj, true);
                    }
                });

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################

                resetWatchedQty();
            });
}(angular));
