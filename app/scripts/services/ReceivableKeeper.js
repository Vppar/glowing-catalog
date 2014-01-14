(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(id, title, document) {

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
                this.canceled = false;
            }

            ObjectUtils.ro(this, 'id', this.id);
        };

        return service;
    });
    angular.module('tnt.catalog.receivable.keeper', [
        'tnt.utils.array'
    ]).service('ReceivableKeeper', function ReceivableKeeper(Receivable, JournalKeeper, JournalEntry) {

        var currentEventVersion = 1;
        var receivables = [];
        
        this.handlers = {};

        /**
         * Registering handlers
         */
        ObjectUtils.ro(this.handlers, 'receivableAddV1', function(event) {
            var id = receivables.length + 1;
            
            var receivable = new Receivable(id, event.title, event.document);
            
            receivable.type = event.type;
            receivable.installmentId = event.installmentId;
            receivable.duedate = event.duedate;
            receivable.amount = event.amount;

            receivables.push(receivable);
        });

        ObjectUtils.ro(this.handlers, 'updateAddV1', function(event) {

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

        // Publishing
        this.list = list;
        this.add = add;

    });
}(angular));