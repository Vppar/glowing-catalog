(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.entity', []).factory('Voucher', function Voucher() {

        var service = function svc(id, entity, type, amount) {

            var validProperties = [
                'id', 'entity', 'type', 'amount', 'redeemed', 'canceled', 'remarks', 'document'
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
                throw 'Voucher must be initialized with an id, entity, type and amount';
            }
            ObjectUtils.ro(this, 'id', id);
            this.entity = entity;
            this.type = type;
            this.amount = amount;
        };

        return service;
    });

    /**
     * The keeper for the current voucher
     */
    angular.module('tnt.catalog.voucher.keeper', [
        'tnt.utils.array'
    ]).service('VoucherKeeper', function VoucherKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Voucher) {

        var currentEventVersion = 1;
        var voucher = {
            voucher : [],
            coupon : [],
            gift : []
        };
        this.handlers = {};

        /**
         * EventHandler of Create.
         */
        ObjectUtils.ro(this.handlers, 'voucherCreateV1', function(event) {
            var entry = ArrayUtils.find(voucher[event.type], 'id', event.id);
            if (entry === null) {
                event = new Voucher(voucher[event.type].length, event.entity, event.type, event.amount, event.redeemed, event.canceled, event.remarks, event.document);
                voucher[event.type].push(event);

            } else {
                throw 'Somehow, we got a repeated voucher!?!?';
            }
        });

        /**
         * EventHandler of cancel.
         */
        ObjectUtils.ro(this.handlers, 'voucherCancelV1', function(event) {

            var entry = ArrayUtils.find(voucher[event.type], 'id', event.id);
            if (entry === null) {
                throw 'Entity not found, cosistency must be broken! Replay?';
            } else {
                entry.canceled = true;
            }

        });

        /**
         * EventHandler of redeem.
         */
        ObjectUtils.ro(this.handlers, 'voucherRedeemV1', function(event) {

            var entry = ArrayUtils.find(voucher[event.type], 'id', event.id);

            if (entry === null) {
                throw 'Entity not found, cosistency must be broken! Replay?';
            } else {
                entry.redeemed = true;
            }
        });

        /**
         * Registering the handlers with the Replayer
         */ 
        Replayer.registerHandlers(this.handlers);

        /**
         * create (voucherObject) - The id of the voucher should be null, even if you
         * pass an object with an id, your id will be ignored and replaced
         * 
         */
        this.create = function(voucherObject) {
            
            if(voucherObject instanceof Voucher){
                voucherObject.isValid();
            } else {
                throw "Wrong instance.";
            }
            
            var event = voucherObject;
            event.redeemed = false;
            event.canceled = false;
            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'voucherCreate', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * cancel(type, id)
         */ 
        this.cancel = function(type, id) {

            var event = new Voucher(id, null, type, null);

            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'voucherCancel', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * redeem (type, id)
         */ 
        this.redeem = function(type, id) {

            var event = new Voucher(id, null, type, null);

            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'voucherRedeem', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };
        
        /**
         * list(type)
         */
        this.list = function(type) {
            return angular.copy(voucher[type]);
        };

    });
    
    
    angular.module('tnt.catalog.voucher', [
        'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper'
    ]);

}(angular));