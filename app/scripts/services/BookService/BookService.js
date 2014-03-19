(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.book', [
        'tnt.catalog.bookkeeping.entity', 'tnt.catalog.bookkeeping.entry','tnt.catalog.bookkeeping.keeper'
    ]).service('BookService', ['$q', '$log', 'BookKeeper', 'Book', 'BookEntry', function BookService($q, $log, BookKeeper, Book, BookEntry) {

        // TODO Should this be here?
        this.write = function(entry) {
            return BookKeeper.write(entry);
        };

        this.addBook = function(name, type, nature, entities) {
            BookKeeper.addBook(new Book(null, null, name, type, nature, entities));
        };

        this.list = function() {
            return BookKeeper.list();
        };
        
        this.listByOrder = function(uuid){
            return BookKeeper.listByOrder(uuid);
        };
        
        this.listEntries = function() {
            return BookKeeper.listEntries();
        };
        
        /**
         * Create the proper Book entries for a negotiation
         * 
         * @param {string} documentUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount the total delta in the negotiation
         *            order
         */
        this.negotiation = function(documentUUID, entityUUID, amount){
            var entry;
            if(amount > 0){
                entry = new BookEntry(null, null, 70001, 43005 , documentUUID, entityUUID, 'Acrécimos s/ Recebimentos', amount);
            } else {
                entry = new BookEntry(null, null, 63103, 70001, documentUUID, entityUUID, 'Descontos s/ Recebtos', -amount);
            }
            return [entry];
        };
        
        /**
         * Create the proper Book entries for a sale
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} productAmount the total value for products in this
         *            order
         * @param {number} productCost the total cost for products in this order
         *            based on stock average cost
         * @param {number} voucher the total amount of given vouchers in this
         *            order
         * @param {number} gift the total amount of given giftCards in this
         *            order
         */
        this.order = function(orderUUID, entityUUID, productAmount, voucher, gift) {

            var entries = [];

            if (productAmount) {
                entries.push(new BookEntry(null, null, 70001, 21307, orderUUID, entityUUID, 'Valor bruto da venda', productAmount));
            }

            if (voucher) {
                entries.push(new BookEntry(null, null, 70001, 21301, orderUUID, entityUUID, 'Valor total vale crédito', voucher));
            }

            if (gift) {
                entries.push(new BookEntry(null, null, 70001, 21305, orderUUID, entityUUID, 'Valor total vale presente', gift));
            }

            return entries;
        };

        /**
         * Create the proper Book entries for a product return
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} productAmount the total value for products being
         *            returned
         * @param {number} productCost the total cost for products being
         *            returned based on stock average cost
         */
        this.productReturn = function(orderUUID, entityUUID, productAmount, productCost) {
            var entries = [];

            // Custo do produto
            entries.push(new BookEntry(null, null, 41305, 70001, orderUUID, entityUUID, 'Devolução de produto', productAmount));
            entries.push(new BookEntry(null, null, 11701, 51115, orderUUID, entityUUID, 'Devolução de produto', productCost));

            return entries;
        };
        
        /**
         * Create the proper Book entries for a product delivery
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} productAmount the total value for products being delivered
         * @param {number} productCost the total cost for products being
         *            delivered based on stock average cost
         */
        this.productDelivery = function(orderUUID, entityUUID, productAmount, productCost) {
            var entries = [];

            // Custo do produto
            entries.push(new BookEntry(null, null, 21307, 41305, orderUUID, entityUUID, 'Entrega de produto', productAmount));
            entries.push(new BookEntry(null, null, 51115, 11701, orderUUID, entityUUID, 'Entrega de produto', productCost));

            return entries;
        };
        
        /**
         * Create the proper Book entries for a product payment
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} cash the total sum of cash given as payment
         * @param {number} check the total sum of checks given as payment
         * @param {number} card the total sum of cards given as payment
         * @param {number} cuff the total amount on cuff
         * @param {number} voucher the total sum of vouchers given as payment
         * @param {number} gift the total sum of gift cards given as payment
         * @param {number} discount the total discount given
         * @param {number} coupon the total sum of coupons given as payment
         */
        this.payment = function(orderUUID, entityUUID, cash, check, card, cuff, voucher, gift, discount, coupon) {
            var entries = [];

            if (cash > 0) {
                entries.push(new BookEntry(null, null, 11111, 70001, orderUUID, entityUUID, 'Recebimento em dinheiro', cash));
            } else if (cash < 0) {
                entries.push(new BookEntry(null, null, 70001, 11111, orderUUID, entityUUID, 'Troco em dinheiro', -cash));
            }
            if (check) {
                entries.push(new BookEntry(null, null, 11121, 70001, orderUUID, entityUUID, 'Recebimento em cheque', check));
            }
            if (card) {
                entries.push(new BookEntry(null, null, 11512, 70001, orderUUID, entityUUID, 'Recebimento em cartão', card));
            }
            if (cuff) {
                entries.push(new BookEntry(null, null, 11511, 70001, orderUUID, entityUUID, 'Saldo a receber', cuff));
            }
            if (voucher) {
                entries.push(new BookEntry(null, null, 21301, 70001, orderUUID, entityUUID, 'Abatimento vale crédito', voucher));
            }
            if (gift) {
                entries.push(new BookEntry(null, null, 21305, 70001, orderUUID, entityUUID, 'Abatimento vale presente', gift));
            }
            if (discount) {
                entries.push(new BookEntry(null, null, 41301, 70001, orderUUID, entityUUID, 'Desconto concedido', discount));
            }
            if (coupon) {
                entries.push(new BookEntry(null, null, 41303, 70001, orderUUID, entityUUID, 'Desconto cupom promocional', coupon));
            }

            return entries;
        };
        
        this.deposit = function(account, amount, documentUUID, entityUUID){
            return [new BookEntry(null, null, account, 70001, documentUUID, entityUUID, 'Recebimento', amount)];
        };
        
        this.withdraw = function(account, amount, documentUUID, entityUUID){
            return [new BookEntry(null, null, 70001, account, documentUUID, entityUUID, 'Pagamento', amount)];
        };

        /**
         * Write the proper Book entry for receivables liquidation.
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
         * 
         * @param {string} type the type of receivable to liquidate
         * @param {string} documentUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount to be paid
         */
        this.liquidate = function (type, documentUUID, entityUUID, amount) {
            var entry = null;
            
            if (type === 'check') {
                entry = new BookEntry(null, null, 70001, 11121, documentUUID, entityUUID, 'Recebimento em cheque', amount);
            } else if (type === 'creditCard') {
                entry = new BookEntry(null, null, 70001, 11512, documentUUID, entityUUID, 'Recebimento em cartão', amount);
            } else if (type === 'onCuff') {
                entry = new BookEntry(null, null, 70001, 11511, documentUUID, entityUUID, 'Saldo a receber', amount);
            } else {
                var logInfo = {
                    type : type,
                    documentUUID : documentUUID,
                    entityUUID : entityUUID,
                    amount : amount
                };
                $log.fatal('Failed to identify the receivable liquidation type: BookService.liquidate with: ', logInfo);
            }
            return [entry];
        };
        
        this.validate = function(entries) {

            var amount = 0;

            for ( var entry in entries) {
                if (BookKeeper.getNature(entry.debitAccount) === 'credit') {
                    amount += entry.amount;
                } else {
                    amount -= entry.amount;
                }

                if (BookKeeper.getNature(entry.creditAccount) === 'credit') {
                    amount += entry.amount;
                } else {
                    amount -= entry.amount;
                }
            }

            return (amount === 0);
        };

    }]);
}(angular));
