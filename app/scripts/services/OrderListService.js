(function (angular) {
    'use strict';

    angular.module('tnt.catalog.orderList.service', [
        'tnt.catalog.receivable.service'
    ]).service(
        'OrderListService',
        [
            '$filter',
            'ReceivableService',
            'BookService',
            'logger',
            function ($filter, ReceivableService, BookService, logger) {
                
                var log = logger.getLogger('tnt.catalog.orderList.service');
                
                /**
                 * 
                 * @param orderUUID
                 * @returns total discount on sale
                 */
                this.getTotalDiscountByOrder = function (orderUUID) {
                    return this.getTotalByType(orderUUID, 'discount').amount;
                };

                /**
                 * @param orderUUID
                 * @param type - use to set the debit and credit account
                 * @returns @object {amount : total amount,
                 *                   qty: }
                 */
                this.getTotalByType = function (orderUUID, type) {
                    if (type === 'cash') {
                        return this.getTotalByOrder(orderUUID, 70001, 11111);
                    } else if (type === 'check') {
                        return this.getTotalByOrder(orderUUID, 70001, 11121);
                    } else if (type === 'creditCard') {
                        return this.getTotalByOrder(orderUUID, 70001, 11512);
                    } else if (type === 'onCuff') {
                        return this.getTotalByOrder(orderUUID, 70001, 11511);
                    } else if (type === 'voucher') {
                        return this.getTotalByOrder(orderUUID, 70001, 21301);
                    } else if (type === 'exchange') {
                        return this.getTotalByOrder(orderUUID, 70001, 41305);
                    } else if (type === 'discount') {
                        return this.getTotalByOrder(orderUUID, 70001, 41301);
                    } else {
                        log.fatal('No type found for this call. ', 'orderUUID: ', orderUUID, 'type: ',type);
                    }

                };

                this.getTotalByOrder =
                    function (orderUUID, creditAccount, debitAccount) {
                        var bookEntries = BookService.listByOrder(orderUUID);
                        bookEntries =
                            $filter('filter')(
                                bookEntries,
                                function (entry) {
                                    return (entry.debitAccount === debitAccount) &&
                                        (entry.creditAccount === creditAccount);
                                });

                        var amount = $filter('sum')(bookEntries, 'amount');
                        return {
                            amount : amount,
                            qty : bookEntries.length,
                        };
                    };

            }
        ]);
}(angular));