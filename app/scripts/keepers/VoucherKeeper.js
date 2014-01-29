(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.entity', []).factory('Voucher', function Voucher() {

        // BE AWARE! For giftcards, the entity here is the person that will use
        // it (not the buyer)!
        var service = function svc(id, entity, type, amount) {

            var validProperties = [
                'id', 'entity', 'type', 'amount', 'redeemed', 'canceled', 'created', 'remarks', 'document'
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
                    throw 'Voucher must be initialized with id, entity, type and amount';
                }
            } else {
                this.id = id;
                this.entity = entity;
                this.type = type;
                this.amount = amount;
            }

            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'entity', this.entity);
            ObjectUtils.ro(this, 'type', this.type);
            ObjectUtils.ro(this, 'amount', this.amount);
        };

        return service;
    });

    /**
     * The keeper for the current voucher
     */
    angular.module(
            'tnt.catalog.voucher.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.voucher.entity',
                'tnt.catalog.journal.keeper'
            ]).service('VoucherKeeper', function VoucherKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Voucher) {

        var currentEventVersion = 1;
        var voucher = {
            voucher : [],
            coupon : [],
            giftCard : []
        };
        this.handlers = {};

        /**
         * EventHandler of Create.
         */
        ObjectUtils.ro(this.handlers, 'voucherCreateV1', function(event) {
            var entry = ArrayUtils.find(voucher[event.type], 'id', event.id);
            if (entry === null) {

                event = angular.copy(event);
                event.id = voucher[event.type].length;

                var v = new Voucher(event);

                voucher[event.type].push(v);

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
                entry.canceled = event.canceled;
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
                entry.redeemed = event.redeemed;
            }
        });

        /**
         * Registering the handlers with the Replayer
         */
        Replayer.registerHandlers(this.handlers);

        /**
         * create (voucherObject) - The id of the voucher should be null, even
         * if you pass an object with an id, your id will be ignored and
         * replaced
         * 
         */
        this.create = function(newVoucher) {
            if (!(newVoucher instanceof Voucher)) {
                throw 'Wrong instance to VoucherKeeper';
            }

            var voucherObj = angular.copy(newVoucher);
            voucherObj.id = ArrayUtils.generateUUID();

            var event = new Voucher(voucherObj);
            var stamp = (new Date()).getTime() / 1000;

            event.created = stamp;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'voucherCreate', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * cancel(type, id)
         */
        this.cancel = function(type, id) {
            var vouch = ArrayUtils.find(voucher[type], 'id', id);

            if (!vouch) {
                throw 'Unable to find a voucher with id=\'' + id + '\'';
            }
            var stamp = (new Date()).getTime() / 1000;

            var event = new Voucher(id, null, type, null);
            event.canceled = stamp;

            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'voucherCancel', currentEventVersion, event);

            // save the journal entry
            JournalKeeper.compose(entry);
        };

        /**
         * redeem (type, id)
         */
        this.redeem = function(type, id) {
            var vouch = ArrayUtils.find(voucher[type], 'id', id);

            if (!vouch) {
                throw 'Unable to find a voucher with id=\'' + id + '\'';
            }

            var stamp = (new Date()).getTime() / 1000;

            var event = new Voucher(id, null, type, null);
            event.redeemed = stamp;

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
    ]).run(function(VoucherKeeper) {
        // Warming up VoucherKeeper
    });

}(angular));
