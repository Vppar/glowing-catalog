'use strict';

describe('Keeper: JournalKeeper', function() {

    var PersistentStorage;
    var WebSQLDriver;
    var JournalEntry;
    var JournalKeeper;
    var Replayer;
    var scope;
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');
        module('tnt.catalog.journal.replayer');

        log.warn = console.log;
        log.debug = console.log;
        log.error = console.log;
        log.fatal = console.log;

        spyOn(log, 'error').andCallThrough();
        spyOn(log, 'fatal').andCallThrough();

        module(function($provide) {
            $provide.value('$log', log);
        });

    });

    beforeEach(inject(function(_PersistentStorage_, _WebSQLDriver_, _JournalEntry_,
            _JournalKeeper_, _Replayer_, $rootScope) {

        PersistentStorage = _PersistentStorage_;
        WebSQLDriver = _WebSQLDriver_;
        JournalEntry = _JournalEntry_;
        JournalKeeper = _JournalKeeper_;
        Replayer = _Replayer_;

        scope = $rootScope;
    }));


    function dayToMs(days) {
        return days * 24 * 60 * 60 * 1000;
    }


    // Tests JournalKeeper.compose() scenarios
    ddescribe('Journal entry composition', function () {
        // We are testing only a happy day scenario. This is intentional
        // (for now). If you have some spare time, feel free to
        // implement failure scenarios.


        before(function () {
            // Create some VALID journal entries
            JournalKeeper.nuke();

            var validJournalEntries = [];
            var now = new Date();

            // Create an entity
            validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(4), 'entityCreate', 1, {
                created : now.getTime() - dayToMs(4),
                name : 'Scarlett Johanson',
                phones : [{
                    number : '2188991010'
                }],
                uuid : "cc02b600-5d0b-11e3-96c3-010001000005"
            }));


            // Create a voucher
            validJournalEntries.push(new JournalEntry(null, now.getTime(), 'voucherCreate', 1, {
                amount : 20,
                created : now.getTime() - dayToMs(1),
                entity : "cc02b600-5d0b-11e3-96c3-010001000005",
                id : "cc02b600-5d0b-11e3-96c3-020001000001",
                type : 'voucher'
            }));


            // Create a new type of voucher
            validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(3), 'voucherCreate', 1, {
                amount : 50,
                created : now.getTime() - dayToMs(3),
                entity : "cc02b600-5d0b-11e3-96c3-010001000005",
                id : "cc02b600-5d0b-11e3-96c3-020001000004",
                type : 'giftCard'
            }));


            for(var idx in validJournalEntries) {
                expect(function () {
                    JournalKeeper.compose(validJournalEntries[idx]);
                }).not.toThrow();

                expect(log.fatal).not.toHaveBeenCalled();
                expect(log.error).not.toHaveBeenCalled();
            }
        });


        it('stores the given journal entry in the persistent storage', function () {

        });

        it('updates entries\' sequence');
        it('replays the entry to its keeper');

    }); // Journal entry composition

});
