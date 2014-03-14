(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.book', [
        'tnt.catalog.bookkeeping.entity', 'tnt.catalog.bookkeeping.entry'
    ]).service('BookService', ['$q','$filter', '$log', 'BookKeeper', 'Book', 'BookEntry', function BookService($q, $filter, $log, BookKeeper, Book, BookEntry) {

        this.write = function(entry) {
            var result = null;
            try {
                result = BookKeeper.write(entry);
            } catch (e) {
                result = $q.reject(e);
            }
            return result;
        };

        this.addBook = function(name, type, nature, entities) {
            BookKeeper.addBook(new Book(null, null, name, type, nature, entities));
        };

        this.snapShot = function(books) {
            BookKeeper.snapShot(books);
        };

        this.list = function() {
            return BookKeeper.list();
        };
        
        this.listByOrder = function(uuid){
            var result = $filter('filter')(this.listEntries(), function(entry){
                return (entry.document.uuid === uuid);
            });
            return result;
        };
        
        this.listEntries = function() {
            return BookKeeper.listEntries();
        };
        
        /**
         * Create the proper Book entries for earning
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount the total amount of given giftCards in this
         *            order
         */
        this.earning = function(orderUUID, entityUUID, amount){
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };
            //FIXME accounts
            var entry = new BookEntry(null, null, 70001, 43005 , document, entityUUID, 'Acrécimos s/ Recebimentos', amount);
            return this.write(entry);
        };
        
        /**
         * Create the proper Book entries for losses
         * 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount the total amount of given giftCards in this
         *            order
         */
        this.losses = function(orderUUID, entityUUID, amount){
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };
            //FIXME - accounts.
            var entry = new BookEntry(null, null, 63103, 70001, document, entityUUID, 'Adiantamentos de Clientes', amount);
            
            return this.write(entry);
        };
        
        /**
         * Create the proper Book entries for a sale
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
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
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };

            if (productAmount) {
                entries.push(new BookEntry(null, null, 70001, 21307, document, entityUUID, 'Valor bruto da venda', productAmount));
            }

            if (voucher) {
                entries.push(new BookEntry(null, null, 70001, 21301, document, entityUUID, 'Valor total vale crédito', voucher));
            }

            if (gift) {
                entries.push(new BookEntry(null, null, 70001, 21305, document, entityUUID, 'Valor total vale presente', gift));
            }

            return entries;
        };

        /**
         * Create the proper Book entries for a product return
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
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
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };

            // Custo do produto
            entries.push(new BookEntry(null, null, 41305, 70001, document, entityUUID, 'Devolução de produto', productAmount));
            entries.push(new BookEntry(null, null, 11701, 51115, document, entityUUID, 'Devolução de produto', productCost));

            return entries;
        };
        /**
         * Create the proper Book entries for a product return
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
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
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };

            if (cash > 0) {
                entries.push(new BookEntry(null, null, 11111, 70001, document, entityUUID, 'Recebimento em dinheiro', cash));
            } else if (cash < 0) {
                entries.push(new BookEntry(null, null, 70001, 11111, document, entityUUID, 'Troco em dinheiro', -cash));
            }
            if (check) {
                entries.push(new BookEntry(null, null, 11121, 70001, document, entityUUID, 'Recebimento em cheque', check));
            }
            if (card) {
                entries.push(new BookEntry(null, null, 11512, 70001, document, entityUUID, 'Recebimento em cartão', card));
            }
            if (cuff) {
                entries.push(new BookEntry(null, null, 11511, 70001, document, entityUUID, 'Saldo a receber', cuff));
            }
            if (voucher) {
                entries.push(new BookEntry(null, null, 21301, 70001, document, entityUUID, 'Abatimento vale crédito', voucher));
            }
            if (gift) {
                entries.push(new BookEntry(null, null, 21305, 70001, document, entityUUID, 'Abatimento vale presente', gift));
            }
            if (discount) {
                entries.push(new BookEntry(null, null, 41301, 70001, document, entityUUID, 'Desconto concedido', discount));
            }
            if (coupon) {
                entries.push(new BookEntry(null, null, 41303, 70001, document, entityUUID, 'Desconto cupom promocional', coupon));
            }

            return entries;
        };

        /**
         * Write the proper Book entry for receivables liquidation.
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
         * 
         * @param {string} type the receivable of liquidation 
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount to be paid
         */
        this.liquidate = function (type, paymentType, orderUUID, entityUUID, amount) {
            var document = {
                uuid : orderUUID,
                type : 'Pedido'
            };
            var entry = null;
            if(type === 'cuff'){
                if(paymentType === 'check'){
                    
                }else if(paymentType === 'deposit'){
                    
                }else if(paymentType === 'cash'){
                    entry = new BookEntry(null, null, 11111, 11511, document, entityUUID, 'Recebimento parcela', amount);
                }else if(paymentType === ''){
                    
                };
                
            } else if (type === 'check') {
                entry = new BookEntry(null, null, 11131, 11121, document, entityUUID, 'Depósito cheque', amount);
            } else if (type === 'card') {
                entry = new BookEntry(null, null, 11131, 11512, document, entityUUID, 'Recebimento cartão', amount);
            }
            
            return this.write(entry);
        };
        
        /**
         * Write the proper Book entry for receivables transfer.
         * When a receivable change his liquidation type we must 
         * transfer the amount of receivable between the 
         * old book to new book keeper
         * 
         * Document should not need a type since the type is present in the
         * UUID(Is this right?)
         * 
         * @param {string} newType receivable liquidation type 
         * @param {string} oldType receivable liquidation type
         * @param {string} orderUUID the order UUID
         * @param {string} entityUUID the entity UUID
         * @param {number} amount to be transfer
         */
        this.transfer =
            function (newType, oldType, orderUUID, entityUUID, amount) {
                var document = {
                    uuid : orderUUID,
                    type : 'Pedido'
                };
            
                var creditAccount = getAccount(oldType);
                var debitAccount = getAccount(newType);
                var op = getOperationName(newType, oldType);
                
                var entry = new BookEntry(null, null, debitAccount, creditAccount, document, entityUUID, op, amount);
        
                return this.write(entry);
            };
        
        function getAccount(type) {
            if (type === 'cuff') {
                return 11511;
            } else if (type === 'check') {
                return 11121;
            } else if (type === 'card') {
                return 11512;
            }
        }
        
        function getOperationName(newType, oldType) {
            if (newType === 'check' && oldType === 'cuff') {
                return 'Transferencia de a receber para cheque';
            }else if (newType === 'check' && oldType === 'card') {
                return 'Transferencia de cartao para cheque';
            }else if (newType === 'cuff' && oldType === 'check') {
                return 'Transferencia de cheque para a receber';
            }else if (newType === 'cuff' && oldType === 'card') {
                return 'Transferencia de cartao para a receber';
            }else if (newType === 'card' && oldType === 'cuff') {
                return 'Transferencia de a receber para cartao';
            }else if (newType === 'card' && oldType === 'check') {
                return 'Transferencia de cheque para cartao';
            }
        }
        
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
