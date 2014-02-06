(function(angular) {
    'use strict';

    angular.module('tnt.catalog.stock.service', []).service(
            'StockService',
            function StockService($log, ArrayUtils, InventoryKeeper, StockKeeper) {

                var stockReport =
                        function stockReport(type) {
                            var processStarted = new Date().getTime();

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

                                reportItem.reserve = reportItem.reserve ? reportItem.reserve : 0;

                                if (shouldSkip(type, reportItem)) {
                                    continue;
                                }

                                var session = buildSession(type, report, reportItem);
                                var line = buildLine(type, session, reportItem);

                                report.total.qty += reportItem.qty;
                                report.total.amount += currencyMultiply(reportItem.cost, reportItem.qty);

                                line.items.push(reportItem);
                            }
                            report.total.avgCost = currencyDivide(report.total.amount, report.total.qty);

                            var processDone = new Date().getTime();

                            $log.debug('StockService.stockReport(' + (type ? type : '') + '): -It took ' + (processDone - processStarted) +
                                'ms to create the stockReport.');

                            return report;
                        };

                var shouldSkip = function shouldSkip(type, reportItem) {
                    var result = true;

                    if (type === 'available') {
                        reportItem.qty = reportItem.quantity - reportItem.reserve;
                        result = result & (reportItem.qty <= 0);
                    } else if (type === 'reserved') {
                        reportItem.qty = reportItem.reserve;
                        result = result & (reportItem.qty === 0);
                    } else if (type === 'all') {
                        var minQty = reportItem.reserve - reportItem.quantity;
                        reportItem.minQty = minQty > 0 ? minQty : 0;
                        result = false;
                    }

                    return result;
                };

                var buildSession = function buildSession(type, report, reportItem) {
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
                    session.total.qty += reportItem.qty;
                    session.total.amount += currencyMultiply(reportItem.cost, reportItem.qty);
                    session.total.avgCost = currencyDivide(session.total.amount, session.total.qty);
                    return session;
                };

                var buildLine = function buildLine(type, session, reportItem) {
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
                    line.total.qty += reportItem.qty;
                    line.total.amount += currencyMultiply(reportItem.cost, reportItem.qty);
                    line.total.avgCost = currencyDivide(line.total.amount, line.total.qty);
                    return line;
                };

                var currencyMultiply = function currencyMultiply(value1, value2) {
                    return Math.round(100 * (Number(value1) * Number(value2))) / 100;
                };

                var currencyDivide = function currencyDivide(value1, value2) {
                    var result = 0;
                    if (value2 !== 0) {
                        result = Math.round(100 * (Number(value1) / Number(value2))) / 100;
                    }
                    return result;
                };

                var findInStock = function findInStock(items) {
                    var copyList = angular.copy(StockKeeper.list());
                    var result = [];
                    if(items.length>1){
                        for ( var ix in items) {
                            result.push(ArrayUtils.find(copyList, 'inventoryId', items[ix].id));
                        }
                    }else{
                        result = (ArrayUtils.find(copyList, 'inventoryId', items.id+1)); 
                    }
                    return result;
                };

                this.findInStock = findInStock;
                this.buildLine = buildLine;
                this.buildSession = buildSession;
                this.stockReport = stockReport;
            });
}(angular));