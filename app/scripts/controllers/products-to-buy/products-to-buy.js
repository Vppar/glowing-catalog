(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.ctrl', [
        'tnt.catalog.stock.service', 'tnt.catalog.timer.service'
    ]).controller('ProductsToBuyCtrl', function($scope, $log, StockService, PurchaseOrderService) {

        // #####################################################################################################
        // Local variables
        // #####################################################################################################


        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

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

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        $scope.stockReport = StockService.stockReport('all');
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
        $scope.summary.total.amount2 = 0;
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

        /**
         * Ticket tab
         */
        $scope.ticket = {};
        $scope.ticket.watchedQty = {};
        $scope.ticket.selectedPart = 'part1';
        $scope.ticket.loadPurchaseOrders = loadPurchaseOrders;
        $scope.ticket.purchaseOrders = {};

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
                angular.extend($scope.stockReport, StockService.stockReport('all'));
                StockService.updateReport($scope.stockReport);
            }, 0);
            resetWatchedQty();
            loadPurchaseOrders();
        };

        // #####################################################################################################
        // Watchers
        // #####################################################################################################

        $scope.$watchCollection('purchaseOrder.watchedQty', function(newObj, oldObj) {
            var diff = {
                amount : 0,
                points : 0
            };

            for ( var ix in newObj) {
                var price = $scope.purchaseOrder.items[ix].price;
                var points = $scope.purchaseOrder.items[ix].points;

                diff.amount += (newObj[ix] * price);
                diff.points += (newObj[ix] * points);
            }

            $scope.summary.total.amount = diff.amount;
            $scope.summary.total.points = diff.points;
        });
        

        // #####################################################################################################
        // Controller warm up
        // #####################################################################################################

        resetWatchedQty();
    });
}(angular));
