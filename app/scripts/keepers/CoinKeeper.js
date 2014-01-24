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
            var vault = [];
            var types = {
                receivable : {
                    entity : Receivable,
                    liquidate : 'received'
                },
                expense : {
                    entity : Expense,
                    liquidate : 'payed'
                }
            };

            this.handlers = {};

            /**
             * Registering handlers
             */
            ObjectUtils.ro(this.handlers, name + 'AddV1', function(event) {
                // Get the coin info from type map, get the respective entity
                // and instantiate
                var Coin = types[name]['entity'];
                vault.push(new Coin(event));
            });
            ObjectUtils.ro(this.handlers, name + 'CancelV1', function(event) {

                var coin = ArrayUtils.find(vault, 'id', event.id);

                if (coin) {
                    coin.canceled = event.canceled;
                } else {
                    throw 'Unable to find a ' + name + ' with id=\'' + event.id + '\'';
                }
            });
            ObjectUtils.ro(this.handlers, name + 'LiquidateV1', function(event) {
                var coin = ArrayUtils.find(vault, 'id', event.id);
                if (coin) {
                    // Get the coin info from type map and get the respective
                    // liquidate variable name
                    var action = types[name]['liquidate'];
                    coin[action] = event[action];
                } else {
                    throw 'Unable to find a ' + name + ' with id=\'' + event.id + '\'';
                }
            });

            /**
             * Returns a copy of all coins in the vault
             * 
             * @return Array - Coins in the vault.
             */
            var list = function list() {
                return angular.copy(vault);
            };

            /**
             * Return a copy of a coin by its id
             * 
             * @param id - Id of the target coin.
             */
            var read = function read(id) {
                return angular.copy(ArrayUtils.find(vault, 'id', id));
            };

            /**
             * Adds a coin to the list
             * 
             * @param coin - Receivable to be added.
             */
            var add = function add(coinOperation) {
                var Coin = types[name]['entity'];

                if(coinOperation instanceof Coin)
                
                // FIXME - use UUID
                coinOperation.id = vault.length + 1;

                var addEv = new Coin(coinOperation);

                var stamp = (new Date()).getTime() / 1000;
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'AddV1', currentEventVersion, addEv);

                // save the journal entry
                JournalKeeper.compose(entry);

            };

            /**
             * Liquidate a coin.
             * 
             * @param id - Identifier to the coin.
             * @param executionDate - Date that the coin was executed(payed or
             *            received).
             */
            var liquidate = function liquidate(id, executionDate) {
                var coin = ArrayUtils.find(vault, 'id', id);
                if (!coin) {
                    throw 'Unable to find a ' + name + ' with id=\'' + id + '\'';
                }
                var action = types[name]['liquidate'];

                var liqEv = {
                    id : id,
                };
                liqEv[action] = executionDate;

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

                var coin = ArrayUtils.find(vault, 'id', id);
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
            this.liquidate = liquidate;
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