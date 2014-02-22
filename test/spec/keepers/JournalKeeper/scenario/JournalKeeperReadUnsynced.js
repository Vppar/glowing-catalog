'use strict';

describe('Keeper: JournalKeeper.readUnsynced() scenario', function() {

    var PersistentStorage;
    var WebSQLDriver;
    var JournalEntry;
    var JournalKeeper;
    var EntityKeeper;
    var scope;
    var log = {};
    var storage;

    // An array holding the valid journal entries created before each test
    var validJournalEntries;

    var now = new Date();

    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');
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
            _JournalKeeper_, _EntityKeeper_, $rootScope) {

        PersistentStorage = _PersistentStorage_;
        WebSQLDriver = _WebSQLDriver_;
        JournalEntry = _JournalEntry_;
        JournalKeeper = _JournalKeeper_;

        EntityKeeper = _EntityKeeper_;

        scope = $rootScope;
    }));


    function dayToMs(days) {
        return days * 24 * 60 * 60 * 1000;
    }


    describe('in happy day scenario', function () {
        // We are testing only a happy day scenario. This is intentional
        // (for now). If you have some spare time, feel free to
        // implement failure scenarios.

        // Clear existing data
        beforeEach(nuke);

        // Create some entries in the journal
        beforeEach(createEntities);

        it('gets the unsynced entries from persistent storage', function () {

            var promise1, promise2;
            var entries;
            var unsyncedEntries;

            runs(function () {
                promise1 = storage.list('JournalEntry', {type : 'entityCreate'});
                promise1.then(function (result) {
                    entries = result;
                });
            });

            runs(function () {
                promise2 = JournalKeeper.readUnsynced();
                promise2.then(function (result) {
                    unsyncedEntries = result;
                });
            });

            waitsFor(function () {
                return entries && unsyncedEntries;
            });

            runs(function () {
                expect(entries.length).toBe(3);
                expect(unsyncedEntries.length).toBe(2);

                for (var idx in entries) {
                    var entry = entries[idx];
                    if (entry.event.uuid === 'cc02b600-5d0b-11e3-96c3-010001000006') {
                        expect(entry.synced > 0).toBe(true);
                    } else {
                        expect(entry.synced).toBe(0);
                    }
                }
            });

        });
    }); // in happy day scenario


    function nuke() {
        // Clear previous data
        var nuked = false;

        runs(function () {
            JournalKeeper.nuke().then(function () {
                log.debug('Nuke before each test');
                nuked = true;
            }, function (err) {
                log.debug('Failed to nuke!', err);
            });
        });

        waitsFor(function () {
            return nuked;
        });
    } // nuke()


    function createEntities() {
        runs(function () {
            storage = new PersistentStorage(WebSQLDriver);
            storage.register('JournalEntry', JournalEntry);

            validJournalEntries = [];

            var entity1 = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000005',
                name : 'Scarlet Johanson',
                phones : [{number : '2188991010'}],
                created : new Date().getTime() - dayToMs(4)
            };

            var entity2 = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
                name : 'Albert Einstein',
                phones : [{number : '1112131415'}],
                created : new Date().getTime() - dayToMs(7)
            };

            var entity3 = {
                uuid : 'cc02b600-5d0b-11e3-96c3-010001000006',
                name : 'Chris Hemsworth',
                phones : [{number : '987654321'}],
                created : new Date().getTime() - dayToMs(9),
            };

            // Create entries
            validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(4), 'entityCreate', 1, entity1));
            validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(7), 'entityCreate', 1, entity2));
            validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(9), 'entityCreate', 1, entity3));

            // Flag one of the entries as synced
            validJournalEntries[2].synced = new Date().getTime() - dayToMs(8);
            validJournalEntries[2].sequence = 3;
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
            // Check that all entries have been replayed to the EntityKeeper
            expect(EntityKeeper.list().length).toBe(3);
        });
    } // createEntities()
});

