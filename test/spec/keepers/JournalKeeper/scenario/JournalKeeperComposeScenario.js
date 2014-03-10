'use strict';

describe('Keeper: JournalKeeper.compose()', function() {

    var PersistentStorage;
    var WebSQLDriver;
    var JournalEntry;
    var JournalKeeper;
    var EntityKeeper;
    var VoucherKeeper;
    var Replayer;
    var Voucher;
    var Entity;
    var scope;
    var log = {};
    var storage;

    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.voucher.entity');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.entity.entity');
        module('tnt.catalog.entity.keeper');

        log.warn = angular.noop;
        log.debug = angular.noop;
        log.error = angular.noop;
        log.fatal = angular.noop;

        spyOn(log, 'error').andCallThrough();
        spyOn(log, 'fatal').andCallThrough();

        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    beforeEach(inject(function(_PersistentStorage_, _WebSQLDriver_, _JournalEntry_,
            _JournalKeeper_, _Replayer_, _VoucherKeeper_, _EntityKeeper_, $rootScope) {

        PersistentStorage = _PersistentStorage_;
        WebSQLDriver = _WebSQLDriver_;
        JournalEntry = _JournalEntry_;
        JournalKeeper = _JournalKeeper_;
        Replayer = _Replayer_;

        EntityKeeper = _EntityKeeper_;
        VoucherKeeper = _VoucherKeeper_;

        scope = $rootScope;
    }));


    function dayToMs(days) {
        return days * 24 * 60 * 60 * 1000;
    }


    // Tests JournalKeeper.compose() scenarios
    describe('in a happy day', function () {
        // We are testing only a happy day scenario. This is intentional
        // (for now). If you have some spare time, feel free to
        // implement failure scenarios.

        beforeEach(function () {
            // Create some VALID journal entries
            var nuked = false;

            runs(function () {
                JournalKeeper.nuke().then(function () {
                    log.debug('Nuke before each test');
                    nuked = true;
                }, function (err) {
                    console.log('Failed to nuke!', err);
                });
            });

            waitsFor(function () {
                scope.$apply();
                return nuked;
            }, 'Nuke to complete');
        });


        var validJournalEntries;
        var now;

        beforeEach(function () {
            runs(function () {
                storage = new PersistentStorage(WebSQLDriver);
                storage.register('JournalEntry', JournalEntry);

                validJournalEntries = [];
                now = new Date();

                var entity = {
                    uuid : 'cc02b600-5d0b-11e3-96c3-010001000005',
                    name : 'Scarlet Johanson',
                    phones : [{number : '2188991010'}],
                    created : new Date().getTime() - dayToMs(8)
                };

                var voucher1 = {
                    id : 'cc02b600-5d0b-11e3-96c3-010001000051',
                    entity : 'cc02b600-5d0b-11e3-96c3-010001000005',
                    type : 'giftCard',
                    amount : 30,
                    created : new Date().getTime() - dayToMs(4)
                };

                var voucher2 = {
                    id : 'cc02b600-5d0b-11e3-96c3-010001000053',
                    entity : 'cc02b600-5d0b-11e3-96c3-010001000005',
                    type : 'voucher',
                    amount : 20,
                    created : new Date().getTime() - dayToMs(2)
                };

                // Create entries
                validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(4), 'entityCreate', 1, entity));
                validJournalEntries.push(new JournalEntry(null, now.getTime(), 'voucherCreate', 1, voucher1));
                validJournalEntries.push(new JournalEntry(null, now.getTime(), 'voucherCreate', 1, voucher2));
            });


            var composeCount = 0;

            function composeEntry(entry) {
                JournalKeeper.compose(entry).then(function () {
                    composeCount++;
                }, function (err) {
                    throw(err);
                });
            }

            runs(function () {
                for(var idx in validJournalEntries) {
                    composeEntry(validJournalEntries[idx]);
                }
            });

            waitsFor(function () {
                return composeCount === validJournalEntries.length;
            });

            runs(function () {
                expect(log.fatal).not.toHaveBeenCalled();
                expect(log.error).not.toHaveBeenCalled();
            });
        });


        it('stores the given journal entry in the persistent storage', function () {
            var persistedEntries = null;
            var promise;

            runs(function () {
                promise = storage.list('JournalEntry');
                
                promise.then(function (journalEntries) {
                    persistedEntries = journalEntries;
                });
            });

            waitsFor(function () {
                return persistedEntries;
            }, 'persisted entries');

            runs(function () {
                expect(persistedEntries.length).toBe(3);

                for (var idx in persistedEntries) {
                    var persistedEntry = persistedEntries[idx];
                    var originalEntry = validJournalEntries[idx];
                    expect(persistedEntry).toEqual(originalEntry);
                }
            });
        });

        it('updates entries\' sequence', function () {
            var persistedEntries = null;
            var promise;

            runs(function () {
                promise = storage.list('JournalEntry');

                promise.then(function (entries) {
                    persistedEntries = entries;
                });
            });

            waitsFor(function () {
                return persistedEntries;
            }, 'persisted entries');


            runs(function () {
                for (var idx in validJournalEntries) {
                    var sequence = parseInt(idx) + 1;
                    expect(validJournalEntries[idx].sequence).toBe(sequence);
                    expect(persistedEntries[idx].sequence).toBe(sequence);
                }
            });

        });

        it('replays the entry to its keeper', function () {
            var entities, vouchers, giftCards;

            runs(function () {
                entities = EntityKeeper.list();
                vouchers = VoucherKeeper.list('voucher');
                giftCards = VoucherKeeper.list('giftCard');
            });

            waitsFor(function () {
                return entities && vouchers && giftCards;
            });

            runs(function () {
                expect(entities.length).toBe(1);
                expect(vouchers.length).toBe(1);
                expect(giftCards.length).toBe(1);

                var entity = {};
                var voucher = {};
                var giftCard = {};

                // We need to use dataCopy because some entities implement methods
                // in their instances (such as isValid). These methods break the
                // comparison later on.
                ObjectUtils.dataCopy(entity, entities[0]);
                ObjectUtils.dataCopy(voucher, vouchers[0]);
                ObjectUtils.dataCopy(giftCard, giftCards[0]);

                expect(entity).toEqual(validJournalEntries[0].event);
                expect(giftCard).toEqual(validJournalEntries[1].event);
                expect(voucher).toEqual(validJournalEntries[2].event);
            });
        });

    }); // Journal entry composition

});
