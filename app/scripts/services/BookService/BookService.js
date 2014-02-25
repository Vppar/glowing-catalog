(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.book', [
        'tnt.catalog.bookkeeping.entity', 'tnt.catalog.bookkeeping.entry'
    ]).service('BookService', function BookService($q, $log, BookKeeper, Book, BookEntry) {

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
            return angular.copy(BookKeeper.list());
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
        this.order = function(orderUUID, entityUUID, productAmount, productCost, voucher, gift) {

            var entries = [];

            if (productAmount) {
                entries.push(new BookEntry(null, null, 70001, 41101, orderUUID, entityUUID, null, productAmount));
                entries.push(new BookEntry(null, null, 51115, 11701, orderUUID, entityUUID, null, productCost));
            }

            if (voucher) {
                entries.push(new BookEntry(null, null, 70001, 21301, orderUUID, entityUUID, null, voucher));
            }

            if (gift) {
                entries.push(new BookEntry(null, null, 70001, 21305, orderUUID, entityUUID, null, gift));
            }
            
            $log.debug('BookService.order', entries);

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

            entries.push(new BookEntry(null, null, 41305, 70001, orderUUID, entityUUID, null, productAmount));
            entries.push(new BookEntry(null, null, 11701, 51115, orderUUID, entityUUID, null, productCost));
            
            $log.debug('BookService.productReturn', entries);

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

            if (cash) {
                entries.push(new BookEntry(null, null, 11111, 70001, orderUUID, entityUUID, null, cash));
            } else if (cash < 0) {
                entries.push(new BookEntry(null, null, 70001, 11111, orderUUID, entityUUID, null, cash));
            }
            if (check) {
                entries.push(new BookEntry(null, null, 11121, 70001, orderUUID, entityUUID, null, check));
            }
            if (card) {
                entries.push(new BookEntry(null, null, 11512, 70001, orderUUID, entityUUID, null, card));
            }
            if (cuff) {
                entries.push(new BookEntry(null, null, 11511, 70001, orderUUID, entityUUID, null, cuff));
            }
            if (voucher) {
                entries.push(new BookEntry(null, null, 21301, 70001, orderUUID, entityUUID, null, voucher));
            }
            if (gift) {
                entries.push(new BookEntry(null, null, 21305, 70001, orderUUID, entityUUID, null, gift));
            }
            if (discount) {
                entries.push(new BookEntry(null, null, 41301, 70001, orderUUID, entityUUID, null, discount));
            }
            if (coupon) {
                entries.push(new BookEntry(null, null, 41303, 70001, orderUUID, entityUUID, null, coupon));
            }
            
            $log.debug('BookService.payment', entries);

            return entries;
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

    });
}(angular));