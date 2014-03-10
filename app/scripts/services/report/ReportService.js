(function (angular) {
    'use strict';

    angular.module('tnt.catalog.report.service', [
        'tnt.catalog.financial.math.service'
    ]).service(
        'ReportService',
        [
            'FinancialMathService',
            /**
             * Service to handle reporting tasks.
             * 
             * @author Arnaldo S. Rodrigues Jr.
             */
            function ReportService (FinancialMathService) {

                this.augmentReserveAndQty =
                    function augmentReserveAndQty (type, reportItem) {
                        reportItem.reserve = reportItem.reserve ? reportItem.reserve : 0;
                        if (type === 'available') {
                            reportItem.qty = reportItem.quantity - reportItem.reserve;
                        } else if (type === 'reserved') {
                            reportItem.qty =
                                reportItem.reserve > reportItem.quantity ? reportItem.quantity
                                    : reportItem.reserve;
                        } else if (type === 'all') {
                            var missingQty = reportItem.reserve - reportItem.quantity;
                            if (missingQty > 0) {
                                reportItem.qty = missingQty;
                                reportItem.minQty = missingQty;
                            } else {
                                reportItem.qty = 0;
                            }
                        }

                        if (reportItem.option) {
                            reportItem.uniqueName = reportItem.SKU + ' - ' + reportItem.option;
                        } else {
                            reportItem.uniqueName = reportItem.SKU;
                        }

                        reportItem.cost = reportItem.cost ? reportItem.cost : reportItem.price;

                        return reportItem;
                    };

                this.shouldFilter = function shouldFilter (filter, reportItem) {
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

                this.shouldSkip = function shouldSkip (type, reportItem) {
                    var result = true;
                    if (type === 'available') {
                        // test if there is no available product should skip
                        result = result && (reportItem.qty <= 0);
                    } else if (type === 'reserved') {
                        // test if there is no reserver of this product should
                        // skip
                        if (result && reportItem.qty === 0) {
                            result = true;
                        } else {
                            result = false;
                        }
                    } else if (type === 'all') {
                        result = false;
                    }
                    return result;
                };

                /**
                 * Builds a session in a report object. If the session already
                 * exist in report summarizes amount, qty and average cost.
                 * 
                 * @param {object} report - Report object.
                 * @param {object} reportItem - Item object.
                 * @return {object} session - Report session object.
                 */
                this.buildSession =
                    function buildSession (report, reportItem) {
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
                        session.total.amount +=
                            FinancialMathService.currencyMultiply(reportItem.cost, reportItem.qty);
                        session.total.avgCost =
                            FinancialMathService.currencyDivide(
                                session.total.amount,
                                session.total.qty);

                        return session;
                    };

                /**
                 * Builds a line in a report object. If the session already
                 * exist in report summarizes amount, qty and average cost.
                 * 
                 * @param {object} report - Report object.
                 * @param {object} reportItem - Item object.
                 */
                this.buildLine =
                    function buildLine (session, reportItem) {
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
                        line.total.amount +=
                            FinancialMathService.currencyMultiply(reportItem.cost, reportItem.qty);
                        line.total.avgCost =
                            FinancialMathService.currencyDivide(line.total.amount, line.total.qty);

                        return line;
                    };
            }
        ]);
})(angular);