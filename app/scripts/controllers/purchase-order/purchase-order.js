(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller(
            'PurchaseOrderCtrl',
            [
                '$scope',
                '$log',
                'ArrayUtils',
                'StockService',
                'PurchaseOrderService',
                'UserService',
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
                                    // backup items to use when a recals is
                                    // needed
                                    $scope.purchaseOrder.items[item.id] = item;
                                    $scope.purchaseOrder.watchedQty[item.id] = item.qty;
                                }
                            }
                        }
                    }

                    function loadPurchaseOrders() {
                        $scope.ticket.purchaseOrders = PurchaseOrderService.list();
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
                    $scope.tabs.selected = 'stashed';

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
                    $scope.purchaseOrder.current = {};
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

                    $scope.isSummaryVisible = function(tabName) {
                        return tabName === 'new' || tabName === 'confirm';
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
                    $scope.summarizer =
                            function(pickerArray, hide) {
                                var diff = {
                                    amount : 0,
                                    points : 0
                                };

                                $scope.summary.total.sessions = {};

                                for ( var ix in pickerArray) {

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
                                            total : 0,
                                            minQty : 0,
                                            orderQty : 0,
                                            avg : 0,
                                            pts : 0,
                                            lines : {}
                                        };
                                    }
                                    if (!$scope.summary.total.sessions[session].lines[line]) {
                                        $scope.summary.total.sessions[session].lines[line] = {
                                            total : 0,
                                            minQty : 0,
                                            orderQty : 0,
                                            avg : 0,
                                            pts : 0
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
                                for ( var ix1 in $scope.summary.total.sessions) {
                                    if ($scope.summary.total.sessions[ix1].orderQty > 0) {
                                        $scope.summary.total.sessions[ix1].avg =
                                                ($scope.summary.total.sessions[ix1].total) / ($scope.summary.total.sessions[ix1].orderQty);
                                    }
                                    for ( var ix2 in $scope.summary.total.sessions[ix1].lines) {
                                        if ($scope.summary.total.sessions[ix1].lines[ix2].orderQty > 0) {
                                            $scope.summary.total.sessions[ix1].lines[ix2].avg =
                                                    ($scope.summary.total.sessions[ix1].lines[ix2].total) /
                                                        ($scope.summary.total.sessions[ix1].lines[ix2].orderQty);
                                        }
                                    }
                                }
                            };

                    // #####################################################################################################
                    // Watchers
                    // #####################################################################################################

                    $scope.$watchCollection('purchaseOrder.watchedQty', function(newObj) {
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
                }
            ]);
})(angular);
