'use strict';

describe('Keeper: JournalKeeper.remove() scenario', function() {

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



    // Tests JournalKeeper.resync() scenarios
    describe('Journal entry removal', function () {

        describe('in happy day scenario', function () {
            // We are testing only a happy day scenario. This is intentional
            // (for now). If you have some spare time, feel free to
            // implement failure scenarios.

            // Clear existing data
            beforeEach(nuke);

            // Create some entries in the journal
            beforeEach(createEntities);


            it('removes the given entry from persistent storage', function () {
                var promise;
                var removed;
                var entries;

                runs(function () {
                    promise = JournalKeeper.remove(validJournalEntries[0]);
                    promise.then(function () {
                        removed = true;
                    }, function (err) {
                        console.log('###', err);
                    });

                    scope.$apply();
                });

                waitsFor(function () {
                    return removed;
                });

                runs(function () {
                    promise = storage.list('JournalEntry', {type : 'entityCreate'});
                    promise.then(function (result) {
                        entries = result;
                    });
                });

                waitsFor(function () {
                    return entries;
                });


                runs(function () {
                    expect(entries.length).toBe(1);
                    expect(entries[0]).toEqual(validJournalEntries[1]);
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
                    created : new Date().getTime() - dayToMs(8)
                };

                var entity2 = {
                    uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
                    name : 'Albert Einstein',
                    phones : [{number : '1112131415'}],
                    created : new Date().getTime() - dayToMs(8)
                };

                // Create entries
                validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(4), 'entityCreate', 1, entity1));
                validJournalEntries.push(new JournalEntry(null, now.getTime() - dayToMs(7), 'entityCreate', 1, entity2));
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
                expect(EntityKeeper.list().length).toBe(2);
            });
        } // createEntities()
    });
});

