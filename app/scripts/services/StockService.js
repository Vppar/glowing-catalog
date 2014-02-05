(function(angular) {
    'use strict';

    angular.module('tnt.catalog.stock.service', []).service(
            'StockService', function StockService(ArrayUtils, InventoryKeeper, StockKeeper) {

                var stockReport = function stockReport() {
                    var inventory = InventoryKeeper.list();
                    var stock = StockKeeper.list();
                    var report = {};

                    for ( var ix in inventory) {
                        var inventoryItem = inventory[ix];
                        var stockItem = ArrayUtils.find(stock, 'id', inventoryItem.id);

                        var reportItem = angular.copy(inventoryItem);
                        angular.extend(reportItem, stockItem);

                        var session = buildSession(report, reportItem);
                        var line = buildLine(session, reportItem);
                        
                        line.items.push(reportItem);
                    }

                    return report;
                };

                var buildSession = function buildSession(report, reportItem) {
                    var session = report[reportItem.session];
                    if (!session) {
                        session = reportItem.session;
                        session.total.qty = 0;
                        session.total.cost = 0;
                    }

                    session.total.qty += reportItem.qty;
                    session.total.cost += reportItem.cost;

                    return session;
                };

                var buildLine = function buildLine(session, reportItem) {
                    var line = session[reportItem.line];
                    if (!line) {
                        line = reportItem.line;
                        line.total.qty = 0;
                        line.total.cost = 0;
                    }

                    line.total.qty += reportItem.qty;
                    line.total.cost += reportItem.cost;
                    return line;
                };

                this.buildLine = buildLine;
                this.buildSession = buildSession;
                this.stockReport = stockReport;
            });
}(angular));