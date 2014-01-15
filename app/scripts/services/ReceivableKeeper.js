(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(id, creationdate, entity, type, amount, duedate) {

            var validProperties = [
                'id', 'creationdate', 'entity', 'document', 'type', 'amount', 'duedate', 'canceled', 'received'
            ];

            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw "Unexpected property " + ix;
                        }
                    }
                }
            });

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Receivable must be initialized with id, creationdate, entity, type, amount, duedate';
                }
            } else {
                this.id = id;
                this.creationdate = creationdate;
                this.entity = entity;
                this.document = id;
                this.type = type;
                this.amount = amount;
                this.duedate = duedate;
            }
            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'creationdate', this.creationdate);
            ObjectUtils.ro(this, 'entity', this.entity);
            ObjectUtils.ro(this, 'type', this.type);
            ObjectUtils.ro(this, 'amount', this.amount);
            ObjectUtils.ro(this, 'duedate', this.duedate);
        };

        return service;
    });
    angular.module('tnt.catalog.receivable.keeper', [
        'tnt.utils.array'
    ]).service('ReceivableKeeper', function ReceivableKeeper(ArrayUtils, Receivable, JournalKeeper, JournalEntry) {

        var currentEventVersion = 1;
        var receivables = [];

        this.handlers = {};

        /**
         * Registering handlers
         */
        ObjectUtils.ro(this.handlers, 'receivableAddV1', function(event) {
            receivables.push(angular.copy(event));
        });
        ObjectUtils.ro(this.handlers, 'receivableCancelV1', function(event) {
            var receivable = ArrayUtils.find(receivables, 'id', event.id);

            if (receivable) {
                receivable.canceled = event.canceled;
            } else {
                throw 'Unable to find a receivable with id=\'' + event.id + '\'';
            }
        });
        ObjectUtils.ro(this.handlers, 'receivableReceiveV1', function(event) {
            var receivable = ArrayUtils.find(receivables, 'id', event.id);
            if (receivable) {
                receivable.received = event.received;
            } else {
                throw 'Unable to find a receivable with id=\'' + event.id + '\'';
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
         * Return a single receivable by its id
         * 
         * @param id - Id of the target receivable.
         */
        var get = function get(id) {
            return angular.copy(ArrayUtils.find(receivables, 'id', id));
        };
        /**
         * Adds a receivable to the list
         * 
         * @param receivable - Receivable to be added.
         */
        var add = function add(receivable) {
            // FIXME - use UUID
            receivable.id = receivables.length + 1;
            var addEv = new Receivable(receivable);

            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'receivableAddV1', currentEventVersion, addEv);

            // save the journal entry
            JournalKeeper.compose(entry);
        };
        /**
         * Receive a payment to a receivable.
         */
        var receive = function receive(id, received) {
            var receivable = ArrayUtils.find(receivables, 'id', id);
            if (!receivable) {
                throw 'Unable to find a receivable with id=\'' + id + '\'';
            }
            var receivedEv = {
                id : id,
                received : received
            };

            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'receivableReceiveV1', currentEventVersion, receivedEv);

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
                throw 'Unable to find a receivable with id=\'' + id + '\'';
            }
            var time = (new Date()).getTime();
            var stamp = time / 1000;
            var cancelEv = {
                id : id,
                canceled : time
            };

            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'receivableCancelV1', currentEventVersion, cancelEv);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        // Publishing
        this.list = list;
        this.add = add;
        this.get = get;
        this.receive = receive;
        this.cancel = cancel;

    });
}(angular));