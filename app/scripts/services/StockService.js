(function(angular) {
    'use strict';

    angular.module('tnt.catalog.stock.service', []).service(
            'StockService', function StockService(ArrayUtils, InventoryKeeper, StockKeeper) {

                var stockReport = function stockReport(type) {
                    var inventory = InventoryKeeper.read();
                    var stock = StockKeeper.list();
                    var report = {};

                    for ( var ix in inventory) {
                        var inventoryItem = inventory[ix];

                        var stockItem = ArrayUtils.find(stock, 'inventoryId', inventoryItem.id);

                        var reportItem = angular.copy(inventoryItem);
                        angular.extend(reportItem, angular.copy(stockItem));

                        if (type === 'productsToBuy') {
                            if (!reportItem.reserve || reportItem.quantity >= reportItem.reserve) {
                                continue;
                            } else {
                                reportItem.minQty = reportItem.reserve - reportItem.quantity; 
                            }
                        }

                        var session = buildSession(report, reportItem);
                        var line = buildLine(session, reportItem);

                        line.items.push(reportItem);
                    }

                    return report;
                };

                var buildSession = function buildSession(report, reportItem) {
                    var sessionLabel = reportItem.session;
                    var session = report[sessionLabel];
                    if (!session) {
                        report[sessionLabel] = {
                            label : sessionLabel,
                            total : {
                                qty : 0,
                                amount : 0
                            }
                        };
                        session = report[sessionLabel];
                    }

                    session.total.qty += Number(reportItem.quantity);
                    session.total.amount += Math.round(100 * (Number(reportItem.quantity) * Number(reportItem.cost))) / 100;

                    return session;
                };

                var buildLine = function buildLine(session, reportItem) {
                    var lineLabel = reportItem.line;
                    var line = session[lineLabel];
                    if (!line) {
                        session[lineLabel] = {
                            label : lineLabel,
                            total : {
                                qty : 0,
                                amount : 0
                            },
                            items : []
                        };
                        line = session[lineLabel];
                    }

                    line.total.qty += Number(reportItem.quantity);
                    line.total.amount += Math.round(100 * (Number(reportItem.quantity) * Number(reportItem.cost))) / 100;

                    return line;
                };

                this.buildLine = buildLine;
                this.buildSession = buildSession;
                this.stockReport = stockReport;
            });
}(angular));