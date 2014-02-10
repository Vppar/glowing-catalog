'use strict';

describe('Keeper: JournalKeeper.resync() scenario', function() {

    var PersistentStorage;
    var WebSQLDriver;
    var JournalEntry;
    var JournalKeeper;
    var EntityKeeper;
    var Replayer;
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
    describe('Journal re-synchronization', function () {

        describe('in happy day scenario', function () {
            // We are testing only a happy day scenario. This is intentional
            // (for now). If you have some spare time, feel free to
            // implement failure scenarios.

            // Clear existing data
            beforeEach(nuke);

            // Create some entries in the journal
            beforeEach(createEntities);

            // Remove entities from keepers (resync should re-insert them)
            beforeEach(clearKeeper);


            it('re-inserts persisted entities for each keeper', function () {
                // Make sure keeper is fresh
                expect(EntityKeeper.list().length).toBe(0);

                var promise;
                var resynced;

                runs(function () {
                    promise = JournalKeeper.resync();
                    promise.then(function () {
                        resynced = true;
                    });

                    scope.$apply();
                });

                waitsFor(function () {
                    return resynced;
                });

                runs(function () {
                    var entities = EntityKeeper.list();
                    expect(entities.length).toBe(2);

                    for (var idx in entities) {
                        var entity = entities[idx];
                        var entityData = {};
                        ObjectUtils.dataCopy(entityData, entity);

                        expect(entityData).toEqual(validJournalEntries[idx].event);
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

                scope.$apply();
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


        function clearKeeper() {
            // Clears all entities from the EntityKeeper
            EntityKeeper.handlers.nukeV1();
            expect(EntityKeeper.list().length).toBe(0);
        } // clearKeepers()
    });
});

