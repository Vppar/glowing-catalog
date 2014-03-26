(function (angular) {
    'use strict';

    angular.module('tnt.catalog.orderList.service', []).service(
        'OrderListService',
        [
            '$filter',
            'ReceivableService',
            'BookService',
            function ($filter, ReceivableService, BookService) {

                /**
                 * 
                 * @param orderUUID
                 * @returns total gross of sales
                 */
                this.getTotalGrossSalesByOrder = function (orderUUID) {
                    var bookEntries = BookService.listByOrder(orderUUID);
                    bookEntries = $filter('filter')(bookEntries, filterByGrossSales);
                    return $filter('sum')(bookEntries, 'amount');
                };

                /**
                 * 
                 * @param orderUUID
                 * @returns total discount on sale
                 */
                this.getTotalDiscountByOrder = function (orderUUID) {
                    var bookEntries = BookService.listByOrder(orderUUID);
                    bookEntries = $filter('filter')(bookEntries, filterByDiscount);
                    return $filter('sum')(bookEntries, 'amount');
                };

                /**
                 * 
                 * @param orderUUID
                 * @returns total profit or discount on receivables edit.
                 */
                this.getEarningsAndLossesByOrder = function (orderUUID) {
                    var entries = ReceivableService.listByDocument(orderUUID);
                    return this.getEarninsAndLossesByReceivable(entries[0].uuid);
                };

                /**
                 * 
                 * @param receivableUUID
                 * @returns {Number} total profit or discount on receivables
                 *          edit.
                 */
                this.getEarninsAndLossesByReceivable =
                    function (receivableUUID) {
                        var bookEntries = BookService.listByOrder(receivableUUID);
                        var discountEntries =
                            $filter('filter')(bookEntries, filterByDiscountWithoutReceive);
                        var extraEntries = $filter('filter')(bookEntries, filterByExtra);

                        var totalDiscount = $filter('sum')(discountEntries, 'amount');
                        var totalExtra = $filter('sum')(extraEntries, 'amount');

                        return totalExtra - totalDiscount;
                    };

                /**
                 * Return only gross sales value of an order acrescimo
                 * creditAccount: 43005 debitAccount: 70001
                 */
                function filterByExtra (bookEntry) {
                    return (bookEntry.debitAccount === 70001) &&
                        (bookEntry.creditAccount === 43005);
                }

                /**
                 * Return only discount wihtout receive. creditAccount: 70001
                 * debitAccount: 63103
                 */
                function filterByDiscountWithoutReceive (bookEntry) {
                    return (bookEntry.debitAccount === 63103) &&
                        (bookEntry.creditAccount === 70001);
                }

                /**
                 * Return only gross sales value of an order
                 */
                function filterByGrossSales (bookEntry) {
                    return (bookEntry.debitAccount === 70001) &&
                        (bookEntry.creditAccount === 21307);
                }

                /**
                 * Return only discount values of an order
                 */
                function filterByDiscount (bookEntry) {
                    var result =
                        (bookEntry.debitAccount === 41301) && (bookEntry.creditAccount === 70001);
                    return result;
                }

            }
        ]);
}(angular));