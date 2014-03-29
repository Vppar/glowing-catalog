(function (angular) {
    'use strict';

    angular.module(
        'tnt.catalog.orderList.service',
        [
            'tnt.catalog.receivable.service',
            'tnt.catalog.financial.math.service',
            'tnt.catalog.misplaced.service'
        ]).service(
        'OrderListService',
        [
            '$filter',
            'ReceivableService',
            'BookService',
            'logger',
            'FinancialMathService',
            'Misplacedservice',
            function ($filter, ReceivableService, BookService, logger, FinancialMathService,
                Misplacedservice) {

                var log = logger.getLogger('tnt.catalog.orderList.service');

                /**
                 * 
                 * @param orderUUID
                 * @returns total discount on sale
                 */
                this.getTotalDiscountByOrder = function (orderUUID, entries) {
                    var start = new Date().getTime();
                    entries = entries || BookService.listByOrder(orderUUID);
                    console.log('fim DiscountByOrder', new Date().getTime() - start);
                    return this.getTotalByType(orderUUID, 'discount', entries).amount;
                    
                };

                /**
                 * @param orderUUID
                 * @returns total discount on sale
                 */
                this.getDiscountCoupomByOrder = function (orderUUID, entries) {
                    entries = entries || BookService.listByOrder(orderUUID);
                    return this.getTotalByOrder(orderUUID, 70001, 41303, entries).amount;
                };

                /**
                 * @param orderUUID
                 * @param type - use to set the debit and credit account
                 * @returns
                 * @Object {amount : total amount, qty: quantity}
                 */
                this.getTotalByType =
                    function (orderUUID, type, bookEntries) {
                        var start = new Date().getTime();
                        var result = 0;
                        if (type === 'cash') {
                            result = this.getTotalByOrder(orderUUID, 70001, 11111, bookEntries);
                        } else if (type === 'check') {
                            result = this.getTotalByOrder(orderUUID, 70001, 11121, bookEntries);
                        } else if (type === 'creditCard') {
                            result = this.getTotalByOrder(orderUUID, 70001, 11512, bookEntries);
                        } else if (type === 'onCuff') {
                            result = this.getTotalByOrder(orderUUID, 70001, 11511, bookEntries);
                        } else if (type === 'voucher') {
                            // vale presente
                            var voucher1 =
                                this.getTotalByOrder(orderUUID, 70001, 21301, bookEntries);
                            // Vale crédito
                            var voucher2 =
                                this.getTotalByOrder(orderUUID, 70001, 21305, bookEntries);
                            voucher1.qty += voucher2.qty;
                            voucher1.amount += voucher2.amount;
                            result = voucher1;
                        } else if (type === 'exchange') {
                            result = this.getTotalByOrder(orderUUID, 70001, 41305, bookEntries);
                        } else if (type === 'discount') {
                            // Desconto vendas
                            var discount1 =
                                this.getTotalByOrder(orderUUID, 70001, 41301, bookEntries);
                            // Desconto cupom promocional
                            var discount2 =
                                this.getTotalByOrder(orderUUID, 70001, 41303, bookEntries);
                            discount1.qty += discount2.qty;
                            discount1.amount += discount2.amount;
                            result = discount1;
                        } else {
                            log.fatal(
                                'No type found for this call. ',
                                'orderUUID: ',
                                orderUUID,
                                'type: ',
                                type);
                        }
                        console.log('fim totalByType', new Date().getTime() - start);
                        return result;
                    };

                this.getTotalByOrder =
                    function (orderUUID, creditAccount, debitAccount, bookEntries) {
                        bookEntries = bookEntries || BookService.listByOrder(orderUUID);
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

                this.distributeDiscountCoupon =
                    function (order, discountCoupom) {
                        var gross = 0;
                        gross += $filter('sum')(order.items, 'amount');
                        gross += $filter('sum')(order.items, 'price', 'qty');
                        Misplacedservice.distributeSpecificDiscount(
                            gross,
                            discountCoupom,
                            order.items);
                    };

            }
        ]);
}(angular));