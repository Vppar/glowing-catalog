(function(angular) {
    'use strict';

    angular.module('tnt.catalog.bookkeeping.entry', []).factory('BookEntry', function() {

        var BookEntry = function svc(uuid, created, debitAccount, creditAccount, document, entity, op, amount) {
            
            var validProperties = ['uuid', 'created', 'debitAccount', 'creditAccount', 'document', 'entity', 'op', 'remark', 'amount'];
            
            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw 'Unexpected property ' + ix;
                        }
                    }
                }
            });
            
            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'BookEntry must be initialized with uuid, created, debitAccount, creditAccount, document, entity, op, remark, amount';
                }
            } else {
                this.uuid = uuid;
                this.created = created;
                this.debitAccount = debitAccount;
                this.creditAccount = creditAccount;
                this.document = document;
                this.entity = entity;
                this.op = op;
                this.remark = remark;
                this.amount = amount;
            }
        };

        return BookEntry;
    });

    angular.module('tnt.catalog.bookkeeping.entry').factory('Book', function() {
        var Book = function svc(name, reference) {

            var validProperties = ['name', 'reference'];
            
            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw 'Unexpected property ' + ix;
                        }
                    }
                }
            });
            
            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Book must be initialized with name, reference.';
                }
            } else {
                this.name = name;
                this.reference = reference;
                this.balance = 0;
            }

        };
        return Book;
    });

    angular.module('tnt.catalog.bookkeeping', [
        'tnt.catalog.journal.replayer', 'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]).service('BookKeeper', function(Replayer, ArrayUtils, Book, JournalEntry, JournalKeeper) {

        var books = [];

        this.handlers = {};

        /**
         * 
         * @param {Object} event
         * @return {Promise}
         */
        ObjectUtils.ro(this.handlers, 'bookWriteV1', function(event) {
            var eventData = angular.copy(event);
            var debitBook = ArrayUtils.find(books, 'name', eventData.debitAccount);

            if (debitBook == null) {
                var book = new Book(eventData.entity, eventData.debitAccount);
                book.balance -= eventData.amount;
                books.push(book);
            } else {
                debitBook.balance = debitBook.balance - eventData.amount;
            }

            var creditBook = ArrayUtils.find(books, 'name', eventData.creditAccount);
            if (!creditBook) {
                var book = new Book(eventData.entity, eventData.creditAccount);
                book.balance += eventData.amount;
                books.push(book);
            } else {
                creditBook.balance += eventData.amount;
            }
        });

        // Nuke event for clearing the books list
        ObjectUtils.ro(this.handlers, 'nukeBooksV1', function() {
            books.length = 0;
            return true;
        });

        Replayer.registerHandlers(this.handlers);

        this.write = function(entry) {

            var event = angular.copy(entry);
            event.created = (new Date()).getTime();

            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'bookWrite', 1, event);
            // save the journal entry
            return JournalKeeper.compose(entry);
        };

        this.read = function() {
            return angular.copy(books);
        };
    });

})(angular);
