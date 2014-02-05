'use strict';

describe('Service: PersistentStorageFactory', function() {

    // instantiate service
    var PersistentStorage = undefined;
    var driver = undefined;
    var JournalEntry = undefined;
    var scope = undefined;
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');

        log.warn = jasmine.createSpy('warn');
        log.debug = function() {};
        log.error = function() {
        };

        module(function($provide) {
            $provide.value('$log', log);
        });

    });

    beforeEach(inject(function(_PersistentStorage_, WebSQLDriver, _JournalEntry_, $rootScope) {
        PersistentStorage = _PersistentStorage_;
        driver = WebSQLDriver;
        JournalEntry = _JournalEntry_;
        scope = $rootScope;
    }));

    // register
    it('should register a entity', function() {
        // get a service from the factory
        var storage = new PersistentStorage(driver);

        // create a constructor
        var Entity = function Entity() {
        };

        // register
        storage.register('foo', Entity);

        expect(log.warn).not.toHaveBeenCalled();
    });

    // register
    it('should replace an already registered entity', function() {
        // get a service from the factory
        var storage = null;

        var Entity = function Entity() {
        };

        var AnotherEntity = function AnotherEntity() {
        };

        runs(function() {
            storage = new PersistentStorage(driver);

            // register
            storage.register('foo', Entity);

        });

        waitsFor(function() {
            scope.$apply();
            return true;
        });

        runs(function() {

            // register
            storage.register('foo', AnotherEntity);

        });

        waitsFor(function() {
            scope.$apply();
            return true;
        });

        runs(function() {
            expect(log.warn).toHaveBeenCalled();
        });
    });

    // persist
    // TODO maybe a generic test will be needed in the future
    it('should persist a journal', function() {

        var ok = false;
        var result = undefined;
        var storage = undefined;
        var promise = undefined;

        var dropBucket = false;

        runs(function() {
            // drop a bucket
            var txBody = function(tx) {
                driver.dropBucket(tx, 'JournalEntry');
            };

            var promise = driver.transaction(txBody);

            promise.then(function() {
                dropBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return dropBucket;
        });

        // persist something
        runs(function() {

            storage = new PersistentStorage(driver);
            storage.register('JournalEntry', JournalEntry);

            var je = new JournalEntry('i', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // list something
        runs(function() {

            ok = false;

            promise = storage.list('JournalEntry');

            promise.then(function(value) {
                result = value;
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        runs(function() {
            ok = false;
            var returned = result[0];

            expect(returned.sequence).toEqual('i');
            expect(returned.stamp).toEqual('a');
            expect(returned.type).toEqual('b');
            expect(returned.version).toEqual('c');
            expect(returned.event).toEqual('d');
        });

    });

    // FIXME
    // find
    it('should find the persisted entity', function() {
        var ok = false;
        var result = undefined;
        var storage = undefined;
        var promise = undefined;

        var dropBucket = false;

        runs(function() {
            // drop a bucket
            var txBody = function(tx) {
                driver.dropBucket(tx, 'JournalEntry');
            };

            var promise = driver.transaction(txBody);

            promise.then(function() {
                dropBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return dropBucket;
        });

        // persist something
        runs(function() {

            storage = new PersistentStorage(driver);
            storage.register('JournalEntry', JournalEntry);

            var je = new JournalEntry('i', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // find something
        runs(function() {

            ok = false;

            promise = storage.find('JournalEntry', 'i');

            promise.then(function(value) {
                result = value;
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        runs(function() {
            ok = false;
        });
    });

    // list
    it('should list all entities from a bucket', function() {

        var ok = false;
        var result = undefined;
        var storage = undefined;
        var promise = undefined;
        var dropBucket = false;

        runs(function() {
            // drop a bucket
            var txBody = function(tx) {
                driver.dropBucket(tx, 'JournalEntry');
            };

            var promise = driver.transaction(txBody);

            promise.then(function() {
                dropBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return dropBucket;
        });

        // persist something
        runs(function() {

            storage = new PersistentStorage(driver);
            storage.register('JournalEntry', JournalEntry);

            var je = new JournalEntry('i1', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // persist something
        runs(function() {
            ok = false;

            var je = new JournalEntry('i2', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // persist something
        runs(function() {
            ok = false;

            var je = new JournalEntry('i3', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // list something
        runs(function() {

            ok = false;

            promise = storage.list('JournalEntry');

            promise.then(function(value) {
                result = value;
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        runs(function() {
            ok = false;

            expect(result.length).toBe(3);
            expect(result[0].sequence).toEqual('i1');
            expect(result[1].sequence).toEqual('i2');
            expect(result[2].sequence).toEqual('i3');

        });
    });

    // remove
    it('should remove a entity from the bucket', function() {
        var ok = false;
        var result = undefined;
        var storage = undefined;
        var promise = undefined;

        var dropBucket = false;

        runs(function() {
            // drop a bucket
            var txBody = function(tx) {
                driver.dropBucket(tx, 'JournalEntry');
            };

            var promise = driver.transaction(txBody);

            promise.then(function() {
                dropBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return dropBucket;
        });

        // persist something
        runs(function() {

            storage = new PersistentStorage(driver);
            storage.register('JournalEntry', JournalEntry);

            var je = new JournalEntry('i', 'a', 'b', 'c', 'd');

            promise = storage.persist(je);

            promise.then(function() {
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // remove
        runs(function() {
            ok = false;
          
            var je = new JournalEntry('i', null, null, null, null);
            promise = storage.remove(je);
            
            promise.then(function() {
                ok = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        // list something
        runs(function() {
            ok = false;

            promise = storage.list('JournalEntry');

            promise.then(function(value) {
                result = value;
                ok = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        runs(function() {
            ok = false;

            expect(result.length).toBe(0);
        });
    });
});
