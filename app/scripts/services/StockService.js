(function (angular) {
    'use strict';

    angular.module(
        'tnt.catalog.stock.service',
        [
            'tnt.catalog.inventory',
            'tnt.catalog.stock',
            'tnt.catalog.financial.math.service',
            'tnt.catalog.report.service'
        ])
        .service(
            'StockService',
            [
                '$q',
                'logger',
                'InventoryKeeper',
                'Stock',
                'StockKeeper',
                'ArrayUtils',
                'FinancialMathService',
                'ReportService',
                function StockService ($q, logger, InventoryKeeper, Stock, StockKeeper, ArrayUtils,
                    FinancialMathService, ReportService) {
                    
                    var log = logger.getLogger('tnt.catalog.stock.service');
                    
                    // ###############################################################################################
                    // Public methods
                    // ###############################################################################################

                    this.isValid =
                        function (item) {
                            var invalidProperty = {};

                            // just name and phone are mandatory
                            invalidProperty.inventoryId = angular.isDefined(item.inventoryId);
                            invalidProperty.quantity =
                                angular.isDefined(item.quantity) &&
                                    angular.isNumber(item.quantity) && item.quantity > 0;
                            invalidProperty.cost =
                                angular.isDefined(item.cost) && angular.isNumber(item.cost) &&
                                    item.cost > 0;

                            var result = [];

                            for ( var ix in invalidProperty) {
                                if (!invalidProperty[ix]) {
                                    // Create a new empty object, set a
                                    // property
                                    // with the name of the invalid
                                    // property,
                                    // fill it with the invalid value and
                                    // add to
                                    // the result
                                    var error = {};
                                    error[ix] = item[ix];
                                    result.push(error);
                                }
                            }

                            return result;
                        };

                    this.add = function add (item) {
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
                    
                    this.remove = function (item) {
                        var result = null;

                        var hasErrors = this.isValid(item);

                        if (hasErrors.length === 0) {
                            var stockEntry = new Stock(item.inventoryId, item.quantity, item.cost);
                            result = StockKeeper.remove(stockEntry.inventoryId, stockEntry.quantity);
                        } else {
                            log.error('StockService.remove: -Invalid item. ', hasErrors);
                            result = $q.reject(hasErrors);
                        }
                        return result;
                    };
                    
                    this.unreserve = function (item) {
                        var result = null;

                        var hasErrors = this.isValid(item);

                        if (hasErrors.length === 0) {
                            var stockEntry = new Stock(item.inventoryId, item.quantity, item.cost);
                            stockEntry.reserve = item.reserve;
                            result = StockKeeper.unreserve(stockEntry.inventoryId, stockEntry.reserve);
                        } else {
                            log.error('StockService.unreserve: -Invalid item. ', hasErrors);
                            result = $q.reject(hasErrors);
                        }
                        return result;
                    };

                    this.reportAvailable = function reportAvailable (filter) {
                        return this.stockReport('available', filter);
                    };
                    
                    this.reportReserved = function reportReserved (filter) {
                        return this.stockReport('reserved', filter);
                    };

                    this.stockReport =
                        function stockReport (type, filter) {
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
                                var stockItem =
                                    ArrayUtils.find(stock, 'inventoryId', inventoryItem.id);

                                // and merge it with stock
                                var reportItem = angular.copy(inventoryItem);
                                angular.extend(reportItem, angular.copy(stockItem));

                                // augment the reportItem with undefined
                                // protected reserve property and qty
                                ReportService.augmentReserveAndQty(type, reportItem, filter);

                                if (ReportService.shouldFilter(filter, reportItem) ||
                                    ReportService.shouldSkip(type, reportItem)) {
                                    continue;
                                }

                                var session = ReportService.buildSession(report, reportItem);
                                var line = ReportService.buildLine(session, reportItem);

                                report.total.qty += reportItem.qty;
                                report.total.amount +=
                                    FinancialMathService.currencyMultiply(
                                        reportItem.cost,
                                        reportItem.qty);

                                line.items.push(reportItem);
                            }

                            report.total.avgCost =
                                FinancialMathService.currencyDivide(
                                    report.total.amount,
                                    report.total.qty);

                            return report;
                        };

                    this.updateReport = function updateReport (stockReport, filter) {
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
                                    item.hide = ReportService.shouldFilter(filter, item);
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

                    this.findInStock = function findInStock (itemId) {
                        var copyList = StockKeeper.list();
                        return ArrayUtils.find(copyList, 'inventoryId', itemId);
                    };

                }
            ]);
}(angular));
