(function(angular) {
    'use strict';

    angular.module('tnt.catalog.stock.service', ['tnt.catalog.stock']).service(
            'StockService',
            function StockService($q, $log, ArrayUtils, InventoryKeeper, Stock, StockKeeper) {

                // ###############################################################################################
                // Private methods
                // ###############################################################################################

                var augmentReserveAndQty = function augmentReserveAndQty(type, reportItem) {
                    reportItem.reserve = reportItem.reserve ? reportItem.reserve : 0;
                    if (type === 'available') {
                        reportItem.qty = reportItem.quantity - reportItem.reserve;
                    } else if (type === 'reserved') {
                        reportItem.qty = reportItem.reserve;
                    } else if (type === 'all') {
                        var missingQty = reportItem.reserve - reportItem.quantity;
                        if (missingQty > 0) {
                            reportItem.qty = missingQty;
                            reportItem.minQty = missingQty;
                        } else {
                            reportItem.qty = 0;
                        }
                    }
                };

                var shouldFilter = function shouldFilter(filter, reportItem) {
                    // use the object filter to test if this item should be
                    // included or not.
                    var result = true;
                    if (angular.isObject(filter)) {
                        for ( var ix in filter) {
                            if (reportItem[ix]) {
                                var property = String(reportItem[ix]).toLowerCase();
                                var myFilter = String(filter[ix]).toLowerCase();
                                if (property.indexOf(myFilter) > -1) {
                                    result = false;
                                    break;
                                }
                            }
                        }
                    } else {
                        result = false;
                    }
                    return result;
                };

                var shouldSkip = function shouldSkip(type, reportItem) {
                    var result = true;
                    if (type === 'available') {
                        // test if there is no available product should skip
                        result = result & (reportItem.qty <= 0);
                    } else if (type === 'reserved') {
                        // test if there is no reserver of this product should
                        // skip
                        result = result & (reportItem.qty === 0);
                    } else if (type === 'all') {
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

                // ###############################################################################################
                // Public methods
                // ###############################################################################################

                this.isValid = function(item) {
                    var invalidProperty = {};

                    // just name and phone are mandatory
                    invalidProperty.inventoryId = angular.isDefined(item.inventoryId);
                    invalidProperty.quantity = angular.isDefined(item.quantity) && angular.isNumber(item.quantity) && item.quantity > 0;
                    invalidProperty.quantity = angular.isDefined(item.cost) && angular.isNumber(item.cost) && item.cost > 0;

                    var result = [];

                    for ( var ix in invalidProperty) {
                        if (!invalidProperty[ix]) {
                            // Create a new empty object, set a property
                            // with the name of the invalid property,
                            // fill it with the invalid value and add to
                            // the result
                            var error = {};
                            error[ix] = item[ix];
                            result.push(error);
                        }
                    }

                    return result;
                };

                this.add = function add(item) {
                    var result = null;

                    var hasErrors = this.isValid(item);

                    if (hasErrors.length === 0) {
                        var stockEntry = new Stock(item.inventoryId, item.quantity, item.cost);
                        result = StockKeeper.add(stockEntry);
                    } else {
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };

                this.stockReport =
                        function stockReport(type, filter) {
                            // current time for log
                            var processStarted = new Date().getTime();

                            // read inventory and stock
                            var inventory = InventoryKeeper.read();
                            var stock = StockKeeper.list();

                            // kickstart to report
                            var report = {
                                total : {
                                    amount : 0,
                                    qty : 0,
                                    avgCost : 0
                                },
                                sessions : {}
                            };

                            for ( var ix in inventory) {
                                // walk though all inventory items
                                var inventoryItem = inventory[ix];
                                // find the stock item
                                var stockItem = ArrayUtils.find(stock, 'inventoryId', inventoryItem.id);

                                // and merge it with stock
                                var reportItem = angular.copy(inventoryItem);
                                angular.extend(reportItem, angular.copy(stockItem));

                                // augment the reportItem with undefined
                                // protected reserve property and qty
                                augmentReserveAndQty(type, reportItem, filter);

                                if (shouldFilter(filter, reportItem) || shouldSkip(type, reportItem)) {
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

                this.updateReport = function updateReport(stockReport, filter) {
                    // products
                    for ( var ix in stockReport.sessions) {
                        // sessions
                        var session = stockReport.sessions[ix];
                        // variables to session total and qty
                        var lineCount = 0;
                        // lines of that session
                        for ( var ix2 in session.lines) {
                            // lines
                            var line = session.lines[ix2];

                            // items of that line
                            var itemCount = 0;
                            for ( var ix3 in line.items) {
                                var item = line.items[ix3];
                                item.hide = shouldFilter(filter, item);
                                if (!item.hide) {
                                    itemCount++;
                                }
                            }
                            if (itemCount === 0) {
                                line.hide = true;
                            } else {
                                line.hide = false;
                                lineCount++;
                            }
                        }
                        if (lineCount === 0) {
                            session.hide = true;
                        } else {
                            session.hide = false;
                        }
                    }
                };

                this.findInStock = function findInStock(itemId) {
                    var copyList = StockKeeper.list();
                    return ArrayUtils.find(copyList, 'inventoryId', itemId);
                };

            });
}(angular));