(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(id, creationdate, entityId, type, amount, duedate) {

            var validProperties = [
                'id', 'creationdate', 'entityId', 'documentId', 'type', 'amount', 'duedate', 'canceled', 'received'
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
                    throw 'Receivable must be initialized with id, creationdate, entityId, type, amount, duedate';
                }
            } else {
                this.id = id;
                this.creationdate = creationdate;
                this.entityId = entityId;
                this.type = type;
                this.amount = amount;
                this.duedate = duedate;
            }
            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'creationdate', this.creationdate);
            ObjectUtils.ro(this, 'entityId', this.entityId);
            ObjectUtils.ro(this, 'type', this.type);
            ObjectUtils.ro(this, 'amount', this.amount);
            ObjectUtils.ro(this, 'duedate', this.duedate);
        };

        return service;
    });

    angular.module('tnt.catalog.expense.entity', []).factory('Expense', function Expense() {

        var service = function svc(id, creationdate, entityId, type, amount, duedate) {

            var validProperties = [
                'id', 'creationdate', 'entityId', 'documentId', 'type', 'amount', 'duedate', 'canceled', 'payed'
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
                    throw 'Expense must be initialized with id, creationdate, entityId, type, amount, duedate';
                }
            } else {
                this.id = id;
                this.creationdate = creationdate;
                this.entityId = entityId;
                this.type = type;
                this.amount = amount;
                this.duedate = duedate;
            }
            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'creationdate', this.creationdate);
            ObjectUtils.ro(this, 'entityId', this.entityId);
            ObjectUtils.ro(this, 'type', this.type);
            ObjectUtils.ro(this, 'amount', this.amount);
            ObjectUtils.ro(this, 'duedate', this.duedate);
        };

        return service;
    });

    angular.module('tnt.catalog.receivable.keeper', [
        'tnt.utils.array', 'tnt.catalog.expense.entity', 'tnt.catalog.receivable.entity'
    ]).factory('CoinKeeper', function CoinKeeper(ArrayUtils, Receivable, JournalKeeper, JournalEntry, Expense) {

        var keepers = {};

        function instance(name) {

            var currentEventVersion = 1;
            var coins = [];

            this.handlers = {};

            /**
             * Registering handlers
             */
            ObjectUtils.ro(this.handlers, name + 'AddV1', function(event) {
                if (name === 'receivable') {
                    coins.push(new Receivable(event));
                } else {
                    coins.push(new Expense(event));
                }
            });
            ObjectUtils.ro(this.handlers, name + 'CancelV1', function(event) {
                var coin = ArrayUtils.find(coins, 'id', event.id);

                if (coin) {
                    coin.canceled = event.canceled;
                } else {
                    throw 'Unable to find a ' + name + ' with id=\'' + event.id + '\'';
                }
            });
            ObjectUtils.ro(this.handlers, name + 'LiquidateV1', function(event) {
                var coin = ArrayUtils.find(coins, 'id', event.id);
                if (coin && name === 'receivable') {
                    coin.received = event.received;
                } else if (coin && name === 'expense') {
                    coin.payed = event.payed;
                } else {
                    throw 'Unable to find a ' + name + ' with id=\'' + event.id + '\'';
                }
            });

            /**
             * Returns a copy of all coins
             * 
             * @return Array - List of coins.
             */
            var list = function list() {
                return angular.copy(coins);
            };

            /**
             * Return a copy of a coin by its id
             * 
             * @param id - Id of the target coin.
             */
            var read = function read(id) {
                return angular.copy(ArrayUtils.find(coins, 'id', id));
            };
            /**
             * Adds a coin to the list
             * 
             * @param coin - Receivable to be added.
             */
            var add = function add(coinOperation) {
                var addEv = null;
                // FIXME - use UUID
                if (!coinOperation.id) {
                    coinOperation.id = coins.length + 1;
                }
                if (name === 'receivable') {
                    addEv = new Receivable(coinOperation);
                } else if (name === 'expense') {
                    addEv = new Expense(coinOperation);
                }
                var stamp = (new Date()).getTime() / 1000;
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'AddV1', currentEventVersion, addEv);

                // save the journal entry
                JournalKeeper.compose(entry);

            };
            /**
             * Receive a payment to a coin.
             */
            var receive = function receive(id, received) {
                var coin = ArrayUtils.find(coins, 'id', id);
                if (!coin) {
                    throw 'Unable to find a ' + name + ' with id=\'' + id + '\'';
                }
                var liqEv = null;
                if (name === 'receivable') {
                    liqEv = {
                        id : id,
                        received : received
                    };
                } else if (name === 'expense') {
                    liqEv = {
                        id : id,
                        payed : received
                    };
                }

                var stamp = (new Date()).getTime() / 1000;
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'LiquidateV1', currentEventVersion, liqEv);

                // save the journal entry
                JournalKeeper.compose(entry);
            };
            /**
             * Cancels a coin.
             * 
             * @param id - Id of the coin to be canceled.
             */
            var cancel = function cancel(id) {

                var coin = ArrayUtils.find(coins, 'id', id);
                if (!coin) {
                    throw 'Unable to find a ' + name + ' with id=\'' + id + '\'';
                }
                var time = (new Date()).getTime();
                var stamp = time / 1000;
                var cancelEv = {
                    id : id,
                    canceled : time
                };

                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'CancelV1', currentEventVersion, cancelEv);

                // save the journal entry
                JournalKeeper.compose(entry);
            };

            // Publishing
            this.list = list;
            this.read = read;
            this.add = add;
            this.receive = receive;
            this.cancel = cancel;
        }

        return function(name) {
            if (!keepers[name]) {
                keepers[name] = new instance(name);
            }
            return keepers[name];
        };
    });
}(angular));