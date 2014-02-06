(function(angular) {
    'use strict';

    angular.module('tnt.catalog.stock.service', []).service(
            'StockService', function StockService(ArrayUtils, InventoryKeeper, StockKeeper) {

                var stockReport = function stockReport(type) {
                    var inventory = InventoryKeeper.read();
                    var stock = StockKeeper.list();
                    var report = {
                        total : {
                            amount : 0,
                            qty : 0,
                            avgCost : 0
                        },
                        sessions : {}
                    };

                    for ( var ix in inventory) {
                        var inventoryItem = inventory[ix];

                        var stockItem = ArrayUtils.find(stock, 'inventoryId', inventoryItem.id);

                        var reportItem = angular.copy(inventoryItem);
                        angular.extend(reportItem, angular.copy(stockItem));

                        if (reportItem.reserve && reportItem.reserve > reportItem.quantity) {
                            reportItem.minQty = reportItem.reserve - reportItem.quantity;
                        } else {
                            reportItem.minQty = 0;
                        }

                        if (shouldSkip(type, reportItem)) {
                            continue;
                        }

                        var session = buildSession(report, reportItem);
                        var line = buildLine(session, reportItem);

                        report.total.amount += currencyMultiply(reportItem.quantity, reportItem.cost);
                        report.total.qty += reportItem.quantity;

                        line.items.push(reportItem);
                    }
                    report.total.avgCost = currencyDivide(report.total.amount, report.total.qty);

                    return report;
                };

                var shouldSkip = function shouldSkip(type, reportItem) {
                    var result = true;

                    if (type === 'available') {
                        var reserve = reportItem.reserve ? reportItem.reserve : 0;
                        result = result & ((reportItem.quantity - reserve) <= 0);
                    } else if (type === 'reserved') {
                        result = result & reportItem.reserve ? false : true;
                    } else {
                        result = false;
                    }

                    return result;
                };

                var buildSession = function buildSession(report, reportItem) {
                    var sessionLabel = reportItem.session;
                    var session = report.sessions[sessionLabel];
                    if (!session) {
                        report.sessions[sessionLabel] = {
                            label : sessionLabel,
                            total : {
                                qty : 0,
                                amount : 0,
                                avgCost : 0
                            },
                            lines : {}
                        };
                        session = report.sessions[sessionLabel];
                    }

                    session.total.qty += Number(reportItem.quantity);
                    session.total.amount += currencyMultiply(reportItem.quantity, reportItem.cost);
                    session.total.avgCost = currencyDivide(session.total.amount, session.total.qty);
                    return session;
                };

                var buildLine = function buildLine(session, reportItem) {
                    var lineLabel = reportItem.line;
                    var line = session.lines[lineLabel];
                    if (!line) {
                        session.lines[lineLabel] = {
                            label : lineLabel,
                            total : {
                                qty : 0,
                                amount : 0,
                                avgCost : 0
                            },
                            items : []
                        };
                        line = session.lines[lineLabel];
                    }

                    line.total.qty += Number(reportItem.quantity);
                    line.total.amount += currencyMultiply(reportItem.quantity, reportItem.cost);
                    line.total.avgCost += currencyDivide(line.total.amount, line.total.qty);
                    return line;
                };

                var currencyMultiply = function currencyMultiply(value1, value2) {
                    return Math.round(100 * (Number(value1) * Number(value2))) / 100;
                };
                var currencyDivide = function currencyMultiply(value1, value2) {
                    var result = 0;
                    if (value2 !== 0) {
                        result = Math.round(100 * (Number(value1) / Number(value2))) / 100;
                    }
                    return result;
                };

                this.buildLine = buildLine;
                this.buildSession = buildSession;
                this.stockReport = stockReport;
            });
}(angular));