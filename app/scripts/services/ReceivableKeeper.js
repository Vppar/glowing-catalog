(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(id, title, document) {

            var validProperties = [
                'id', 'createdate', 'title', 'document', 'canceled', 'type', 'installmentId', 'duedate', 'amount'
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
                    throw 'Receivable must be initialized with id, title and document';
                }
            } else {
                this.id = id;
                this.createdate = new Date().getTime();
                this.title = title;
                this.document = document;
            }

            this.createdate = new Date().getTime();
            this.canceled = false;

            ObjectUtils.ro(this, 'id', this.id);
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
            var localEv = angular.copy(event);
            
            // FIXME - Use a UUID
            localEv.id = receivables.length + 1;
            var receivable = new Receivable(localEv);

            receivables.push(receivable);
        });
        ObjectUtils.ro(this.handlers, 'receivableUpdateV1', function(event) {
            var receivable = ArrayUtils.find(receivables, 'id', event.id);
            if (receivable ) {
                Receivable.prototype.isValid.apply(event);
                for ( var ix in event) {
                    var metadata = Object.getOwnPropertyDescriptor(receivable, ix);
                    if (metadata && metadata.writable) {
                        receivable[ix] = event[ix];
                    } else if (ix !== 'id' && ix !== 'isValid' ) {
                        throw 'Trying to update read-only property \'' + ix + '\'';
                    }
                }
            } else {
                throw 'Unable to find receivable id=' + event.id;
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
            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'receivableAddV1', currentEventVersion, receivable);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * Update a receivable.
         * 
         * @param receivable - Receivable to be updated.
         */
        var update = function update(receivable) {
            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'receivableUpdateV1', currentEventVersion, receivable);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        // Publishing
        this.list = list;
        this.add = add;
        this.get = get;
        this.update = update;

    });
}(angular));