'use strict';

describe('Service: PersistentStorageFactory', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');
    });

    // instantiate service
    var PersistentStorage = undefined;
    var driver = undefined;
    var JournalEntry = undefined;
    var scope = undefined;

    beforeEach(inject(function(_PersistentStorage_, WebSQLDriver, _JournalEntry_, $rootScope) {
      PersistentStorage = _PersistentStorage_;
        driver = WebSQLDriver;
        JournalEntry = _JournalEntry_;
        scope = $rootScope;

    }));

    it('should do something', function() {

        var ok = false;

        var result = undefined;
        var store = undefined;
        var promise = undefined;
        
        runs(function() {

            store = new PersistentStorage(driver);
            store.register('JournalEntry', JournalEntry);

            var je = new JournalEntry('i', 'a', 'a', 'a', 'a');

            promise = store.persist(je);
            
            promise.then(function(){
                ok = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return ok;
        });

        runs(function() {
            
            ok = false;
            
            promise = store.list('JournalEntry');
            
            promise.then(function(value) {
                ok = true;
                result = value;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return ok;
        });
        
        runs(function() {
            ok = false;
            
            promise.then(function(value) {
                ok = true;
                result = value;
            });
//            
//            expect(!!PersistentStorageFactory).toBe(true);
        });
        
        waitsFor(function() {
            scope.$apply();
            return ok;
        });

    });

});
