(function(angular, ObjectUtils) {
    'use strict';

    angular.module ('tnt.catalog.voucher.entity', []).factory (
        'Voucher',
        function Voucher( ) {

            // BE AWARE! For giftcards, the entity here is the person that will
            // use
            // it (not the buyer)!
            var service =
                function svc(id, entity, type, amount) {

                    var validProperties =
                        [
                            'id',
                            'entity',
                            'type',
                            'amount',
                            'redeemed',
                            'canceled',
                            'created',
                            'remarks',
                            'documentId',
                            'origin'
                        ];

                    ObjectUtils.method (svc, 'isValid', function( ) {
                        for ( var ix in this) {
                            var prop = this[ix];

                            if (!angular.isFunction (prop)) {
                                if (validProperties.indexOf (ix) === -1) {
                                    throw 'Unexpected property ' + ix;
                                }
                            }
                        }
                    });

                    if (arguments.length !== svc.length) {
                        if (arguments.length === 1 && angular.isObject (arguments[0])) {
                            svc.prototype.isValid.apply (arguments[0]);
                            ObjectUtils.dataCopy (this, arguments[0]);
                        } else {
                            throw 'Voucher must be initialized with id, entity, type and amount';
                        }
                    } else {
                        this.id = id;
                        this.entity = entity;
                        this.type = type;
                        this.amount = amount;
                    }

                    ObjectUtils.ro (this, 'id', this.id);
                    ObjectUtils.ro (this, 'entity', this.entity);
                    ObjectUtils.ro (this, 'type', this.type);
                    ObjectUtils.ro (this, 'amount', this.amount);
                };

            return service;
        });

    /**
     * The keeper for the current voucher
     */
    angular.module (
        'tnt.catalog.voucher.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.voucher.entity',
            'tnt.catalog.journal.keeper',
            'tnt.identity'
        ])
        .service (
            'VoucherKeeper',
            ['$log', 'Replayer', 'JournalEntry', 'JournalKeeper', 'ArrayUtils', 'Voucher', 'IdentityService',
             function VoucherKeeper($log, Replayer, JournalEntry, JournalKeeper, ArrayUtils,
                Voucher, IdentityService) {

                var type = 7;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var voucher = {
                    voucher : [],
                    coupon : [],
                    giftCard : []
                };

                this.handlers = {};

                function getNextId( ) {
                    return ++currentCounter;
                }

                // Nuke event for clearing the vouchers lists
                ObjectUtils.ro (this.handlers, 'nukeVouchersV1', function( ) {
                    voucher.voucher.length = 0;
                    voucher.coupon.length = 0;
                    voucher.giftCard.length = 0;
                    return true;
                });

                /**
                 * EventHandler of Create.
                 */
                ObjectUtils.ro (this.handlers, 'voucherCreateV1', function(event) {
                    var eventData = IdentityService.getUUIDData (event.id);

                    if (eventData.deviceId === IdentityService.getDeviceId ()) {
                        currentCounter =
                            currentCounter >= eventData.id ? currentCounter : eventData.id;
                    }

                    event = new Voucher (event);
                    voucher[event.type].push (event);

                    return event;
                });

                /**
                 * EventHandler of cancel.
                 */
                ObjectUtils.ro (this.handlers, 'voucherCancelV1', function(event) {

                    var entry = ArrayUtils.find (voucher[event.type], 'id', event.id);
                    if (entry === null) {
                        throw 'Entity not found, cosistency must be broken! Replay?';
                    } else {
                        entry.canceled = event.canceled;
                    }

                    return event.id;
                });

                /**
                 * EventHandler of redeem.
                 */
                ObjectUtils.ro (this.handlers, 'voucherRedeemV1', function(event) {

                    var entry = ArrayUtils.find (voucher[event.type], 'id', event.id);

                    if (entry === null) {
                        throw 'Entity not found, cosistency must be broken! Replay?';
                    } else {
                        entry.redeemed = event.redeemed;
                        entry.documentId = event.documentId;
                    }

                    return event.id;
                });

                /**
                 * Registering the handlers with the Replayer
                 */
                Replayer.registerHandlers (this.handlers);

                /**
                 * create (voucherObject) - The id of the voucher should be
                 * null, even if you pass an object with an id, your id will be
                 * ignored and replaced
                 * 
                 */
                this.create =
                    function(newVoucher) {
                        if (!(newVoucher instanceof Voucher)) {
                            throw 'Wrong instance to VoucherKeeper';
                        }

                        var voucherObj = angular.copy (newVoucher);
                        voucherObj.id = IdentityService.getUUID (type, getNextId ());
                        voucherObj.created = new Date ().getTime ();

                        var event = new Voucher (voucherObj);

                        // create a new journal entry
                        var entry =
                            new JournalEntry (
                                null,
                                voucherObj.created,
                                'voucherCreate',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose (entry);
                    };

                /**
                 * cancel(type, id)
                 */
                this.cancel =
                    function(type, id) {
                        var vouch = ArrayUtils.find (voucher[type], 'id', id);

                        if (!vouch) {
                            throw 'Unable to find a voucher with id=\'' + id + '\'';
                        }

                        var event = new Voucher (id, null, type, null);
                        event.canceled = (new Date ()).getTime ();

                        // create a new journal entry
                        var entry =
                            new JournalEntry (
                                null,
                                event.canceled,
                                'voucherCancel',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose (entry);
                    };

                /**
                 * redeem (type, id)
                 */
                this.redeem =
                    function(type, id, document) {
                        var vouch = ArrayUtils.find (voucher[type], 'id', id);

                        if (!vouch) {
                            throw 'Unable to find a voucher with id=\'' + id + '\'';
                        }

                        var event = new Voucher (id, null, type, null);
                        event.redeemed = (new Date ()).getTime ();
                        event.documentId = document;

                        // create a new journal entry
                        var entry =
                            new JournalEntry (
                                null,
                                event.redeemed,
                                'voucherRedeem',
                                currentEventVersion,
                                event);

                        // save the journal entry
                        return JournalKeeper.compose (entry);
                    };

                /**
                 * list(type)
                 */
                this.list = function(type) {
                    return angular.copy (voucher[type]);
                };

                this.listByDocument =
                    function(document) {
                        var result = [];
                        for ( var type in voucher) {
                            if (voucher.hasOwnProperty (type)) {
                                try {
                                    var voucherList =
                                        ArrayUtils.list (this.list (type), 'documentId', document);
                                    result = result.concat (voucherList);
                                } catch (err) {
                                    $log
                                        .debug ('VoucherKeeper.listByDocument: Unable to recover the list of vouchers. Err=' +
                                            err);
                                }
                            }
                        }
                        return result.length ? result : null;
                    };
                    
                    this.listByOrigin =
                        function(document) {
                            var result = [];
                            for ( var type in voucher) {
                                if (voucher.hasOwnProperty (type)) {
                                    try {
                                        var voucherList =
                                            ArrayUtils.list (this.list (type), 'origin', document);
                                        result = result.concat (voucherList);
                                    } catch (err) {
                                        $log
                                            .debug ('VoucherKeeper.listByOrigin: Unable to recover the list of vouchers. Err=' +
                                                err);
                                    }
                                }
                            }
                            return result.length ? result : null;
                        };


            }]);

    angular.module ('tnt.catalog.voucher', [
        'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper'
    ]).run (['VoucherKeeper', function(VoucherKeeper) {
        // Warming up VoucherKeeper
    }]);

}) (angular, ObjectUtils);
