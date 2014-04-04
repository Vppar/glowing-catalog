(function(angular) {
    'use strict';

    angular
            .module('tnt.catalog.bookkeeping.entry', [])
            .factory(
                    'BookEntry',
                    function() {

                        var BookEntry =
                                function svc(uuid, created, debitAccount, creditAccount, document, entity, op, amount) {

                                    var validProperties = [
                                        'uuid', 'created', 'debitAccount', 'creditAccount', 'document', 'entity', 'op', 'remark', 'amount'
                                    ];

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
                                            throw 'BookEntry must be initialized with uuid, created, debitAccount, creditAccount, document, entity, op, amount';
                                        }
                                    } else {
                                        this.uuid = uuid;
                                        this.created = created;
                                        this.debitAccount = debitAccount;
                                        this.creditAccount = creditAccount;
                                        this.document = document;
                                        this.entity = entity;
                                        this.op = op;
                                        this.amount = amount;
                                    }
                                };

                        return BookEntry;
                    });

    angular.module('tnt.catalog.bookkeeping.entity', []).factory('Book', function() {
        var Book = function svc(uuid, access, name, type, nature, entities) {

            var validProperties = [
                'uuid', 'access', 'name', 'type', 'nature', 'entities', 'balance'
            ];
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
                    throw 'Book must be initialized with access, name, type, nature, entities.';
                }
            } else {
                this.uuid = uuid;
                this.access = access;
                this.name = name;
                this.type = type;
                this.nature = nature;
                this.entities = entities;
                this.balance = 0;
            }
        };
        return Book;
    });

    angular.module('tnt.catalog.bookkeeping.keeper', [
        'tnt.catalog.journal.replayer', 'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]).service('BookKeeper', ['$q','$filter', 'Replayer', 'ArrayUtils', 'Book', 'BookEntry', 'JournalEntry', 'JournalKeeper', 'IdentityService', function($q, $filter, Replayer, ArrayUtils, Book, BookEntry, JournalEntry, JournalKeeper, IdentityService) {

        var type = 8;
        var books = [];
        var bookEntries = [];
        var currentCounter = 0;

        var entryType = 9;
        var entryCurrentCounter = 0;

        this.handlers = {};

        function getNextId() {
            return ++currentCounter;
        }
        function getEntryNextId() {
            return ++entryCurrentCounter;
        }

        /**
         * AddBook
         */
        ObjectUtils.ro(this.handlers, 'addBookV1', function(event) {
            var eventData = IdentityService.getUUIDData(event.uuid);

            if (eventData.deviceId === IdentityService.getDeviceId()) {
                currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
            }

            event = new Book(event);
            books.push(event);

            return event.uuid;
        });

        /**
         * 
         * @param {Object} event
         * @return {Promise}
         */
        ObjectUtils.ro(this.handlers, 'bookWriteV1', function(event) {

            var uuidData = IdentityService.getUUIDData(event.uuid);

            if (uuidData.deviceId === IdentityService.getDeviceId()) {
                entryCurrentCounter = entryCurrentCounter >= uuidData.id ? entryCurrentCounter : uuidData.id;
            }

            var entry = new BookEntry(event);
            bookEntries.push(entry);

            return entry;
        });

        /**
         * SnapBooks
         */
        ObjectUtils.ro(this.handlers, 'snapBooksV1', function(event) {
            var eventData = angular.copy(event);
            books.length = 0;
            books = eventData;
            currentCounter = books.length;
        });
        /**
         * nukeBooks
         */
        // Nuke event for clearing the books list
        ObjectUtils.ro(this.handlers, 'nukeBooksV1', function() {
            books.length = 0;
            return true;
        });
        
        /**
         * nukeBooks
         */
        // Nuke event for clearing the books list
        ObjectUtils.ro(this.handlers, 'nukeEntriesV1', function() {
            bookEntries.length = 0;
            return true;
        });

        Replayer.registerHandlers(this.handlers);

        this.write = function(entry) {
            if (!(entry instanceof BookEntry)) {
                return $q.reject('Wrong instance to BookKeeper');
            }

            var entryObj = angular.copy(entry);
            entryObj.uuid = IdentityService.getUUID(entryType, getEntryNextId());
            entryObj.created = (new Date()).getTime();

            var event = new BookEntry(entryObj);

            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'bookWrite', 1, event);
            // save the journal entry
            return JournalKeeper.compose(entry);
        };

        this.addBook = function(book) {
            if (!(book instanceof Book)) {
                return $q.reject('Wrong instance to BookKeeper');
            }
            
            // FIXME - If there isn't a book we can't insert an entry
            //var debitBook = ArrayUtils.find(books, 'access', event.debitAccount);
            //var creditBook = ArrayUtils.find(books, 'access', event.creditAccount);

            var bookObj = angular.copy(book);
            bookObj.uuid = IdentityService.getUUID(type, getNextId());

            var event = new Book(bookObj);

            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'addBook', 1, event);
            // save the journal entry
            return JournalKeeper.compose(entry);
        };

        this.snapShot = function(books) {
            var event = angular.copy(books);
            for ( var ix in event) {
                event[ix].created = (new Date()).getTime();
            }
            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'snapBooks', 1, event);
            // save the journal entry
            return JournalKeeper.compose(entry);
        };

        this.nuke = function() {
            var event = {};
            event.created = (new Date()).getTime();

            // create a new journal entry
            var entry = new JournalEntry(null, event.created, 'nukeBooks', 1, event);
            // save the journal entry
            return JournalKeeper.compose(entry);
        };

        this.list = function() {
            return angular.copy(books);
        };
        
        this.listEntries = function() {
            return angular.copy(bookEntries);
        };
        
        this.listByOrder = function(uuid){
            var result = $filter('filter')(bookEntries, function(entry){
                return (entry.document === uuid);
            });
            return angular.copy(result);
        };
        
        this.getNature = function(access) {
            var book = ArrayUtils.find(books, 'access', access);
            return angular.copy(book.nature);
        };
    }]);

    angular.module('tnt.catalog.book', [
        'tnt.catalog.bookkeeping.entity', 'tnt.catalog.bookkeeping.entry', 'tnt.catalog.bookkeeping.keeper'
    ]).run(['BookKeeper', function(BookKeeper) {
        // Warming up BookKeeper
    }]);

})(angular);
