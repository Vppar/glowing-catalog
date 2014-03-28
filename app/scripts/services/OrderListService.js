(function (angular) {
    'use strict';

    angular.module('tnt.catalog.orderList.service', [
        'tnt.catalog.receivable.service','tnt.catalog.financial.math.service', 'tnt.catalog.misplaced.service'
    ]).service(
        'OrderListService',
        [
            '$filter',
            'ReceivableService',
            'BookService',
            'logger',
            'FinancialMathService',
            'Misplacedservice',
            function ($filter, ReceivableService, BookService, logger,FinancialMathService,Misplacedservice) {

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
                 * @returns total discount on sale
                 */
                this.getDiscountCoupomByOrder = function (orderUUID) {
                    return this.getTotalByOrder(orderUUID, 70001, 41303).amount;
                };

                /**
                 * @param orderUUID
                 * @param type - use to set the debit and credit account
                 * @returns
                 * @Object {amount : total amount, qty: quantity}
                 */
                this.getTotalByType =
                    function (orderUUID, type) {
                        if (type === 'cash') {
                            return this.getTotalByOrder(orderUUID, 70001, 11111);
                        } else if (type === 'check') {
                            return this.getTotalByOrder(orderUUID, 70001, 11121);
                        } else if (type === 'creditCard') {
                            return this.getTotalByOrder(orderUUID, 70001, 11512);
                        } else if (type === 'onCuff') {
                            return this.getTotalByOrder(orderUUID, 70001, 11511);
                        } else if (type === 'voucher') {
                            // vale presente
                            var voucher1 = this.getTotalByOrder(orderUUID, 70001, 21301);
                            // Vale crédito
                            var voucher2 = this.getTotalByOrder(orderUUID, 70001, 21305);
                            voucher1.qty += voucher2.qty;
                            voucher1.amount += voucher2.amount;
                            return voucher1;
                        } else if (type === 'exchange') {
                            return this.getTotalByOrder(orderUUID, 70001, 41305);
                        } else if (type === 'discount') {
                            // Desconto vendas
                            var discount1 = this.getTotalByOrder(orderUUID, 70001, 41301);
                            // Desconto cupom promocional
                            var discount2 = this.getTotalByOrder(orderUUID, 70001, 41303);
                            discount1.qty += discount2.qty;
                            discount1.amount += discount2.amount;
                            return discount1;
                        } else {
                            log.fatal(
                                'No type found for this call. ',
                                'orderUUID: ',
                                orderUUID,
                                'type: ',
                                type);
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

                    
                    this.distributeDiscountCoupon = function (order, discountCoupom) {
                        var gross = 0;
                        gross += $filter('sum')(order.items, 'amount');
                        gross += $filter('sum')(order.items, 'price', 'qty');
                        Misplacedservice.distributeSpecificDiscount(gross, discountCoupom, order.items);
                    };
                    
            }
        ]);
}(angular));