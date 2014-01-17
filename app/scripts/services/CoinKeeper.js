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
            var receivables = [];

            this.handlers = {};

            /**
             * Registering handlers
             */
            ObjectUtils.ro(this.handlers, name + 'AddV1', function(event) {
                if (name === 'receivable') {
                    receivables.push(new Receivable(event));
                } else {
                    receivables.push(new Expense(event));
                }
            });
            ObjectUtils.ro(this.handlers, name + 'CancelV1', function(event) {
                var receivable = ArrayUtils.find(receivables, 'id', event.id);

                if (receivable) {
                    receivable.canceled = event.canceled;
                } else {
                    throw 'Unable to find a '+name+' with id=\'' + event.id + '\'';
                }
            });
            ObjectUtils.ro(this.handlers, name + 'LiquidateV1', function(event) {
                var receivable = ArrayUtils.find(receivables, 'id', event.id);
                if (receivable && name === 'receivable') {
                    receivable.received = event.received;
                } else if (receivable && name === 'expense') {
                    receivable.payed = event.payed;
                } else {
                    throw 'Unable to find a '+name+' with id=\'' + event.id + '\'';
                }
            });

            /**
             * Returns a copy of all receivables
             * 
             * @return Array - List of receivables.
             */
            var list = function list() {
                return angular.copy(receivables);
            };

            /**
             * Return a copy of a receivable by its id
             * 
             * @param id - Id of the target receivable.
             */
            var read = function read(id) {
                return angular.copy(ArrayUtils.find(receivables, 'id', id));
            };
            /**
             * Adds a receivable to the list
             * 
             * @param receivable - Receivable to be added.
             */
            var add = function add(coinOperation) {

                if (name === 'receivable') {
                    // FIXME - use UUID
                    coinOperation.id = receivables.length + 1;
                    var addEv = new Receivable(coinOperation);
                } else if (name === 'expense') {
                    // FIXME - use UUID
                    coinOperation.id = receivables.length + 1;
                    var addEv = new Expense(coinOperation);
                }
                var stamp = (new Date()).getTime() / 1000;
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'AddV1', currentEventVersion, addEv);

                // save the journal entry
                JournalKeeper.compose(entry);

            };
            /**
             * Receive a payment to a receivable.
             */
            var receive = function receive(id, received) {
                var receivable = ArrayUtils.find(receivables, 'id', id);
                if (!receivable) {
                    throw 'Unable to find a '+name+' with id=\'' + id + '\'';
                }
                
                if (name === 'receivable') {
                var receivedEv = {
                    id : id,
                    received : received
                };
                }else if (name === 'expense') {
                    var receivedEv = {
                            id : id,
                            payed : received
                        };
                }

                var stamp = (new Date()).getTime() / 1000;
                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'LiquidateV1', currentEventVersion, receivedEv);

                // save the journal entry
                JournalKeeper.compose(entry);
            };
            /**
             * Cancels a receivable.
             * 
             * @param id - Id of the receivable to be canceled.
             */
            var cancel = function cancel(id) {

                var receivable = ArrayUtils.find(receivables, 'id', id);
                if (!receivable) {
                    throw 'Unable to find a '+name+' with id=\'' + id + '\'';
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