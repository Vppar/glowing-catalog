'use strict';

describe('Service: PersistentStorage.update', function() {

    var $q = {};
    var $log = {};
    var $scope = {};

    var webSqlDriverMock = {};
    var PersistentStorage = undefined;
    var persistentObject = undefined;
    var JournalEntry = undefined;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.storage.persistent');
        module('tnt.storage.websql');
        module('tnt.catalog.journal.entity');

        module(function($provide) {
            $provide.value('$log', $log);
            $provide.value('WebSQLDriver', webSqlDriverMock);
        });
        
        webSqlDriverMock.createBucket = jasmine.createSpy('WebSQLDriver.createBucket');
    });

    // inject the the dependencies
    beforeEach(inject(function(_PersistentStorage_, _$q_, _JournalEntry_, _$rootScope_) {
        PersistentStorage = _PersistentStorage_;
        JournalEntry = _JournalEntry_;
        $q = _$q_;
        $scope = _$rootScope_;
    }));

    beforeEach(function() {
        persistentObject = new PersistentStorage(webSqlDriverMock);

    });

    it('should be there', function() {
        expect(!!PersistentStorage).toBe(true);
    });

    it('should create a transaction if none has passed by', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');

        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        persistentObject.register('JournalEntry', JournalEntry);

        var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');

        persistentObject.update(journal);

        expect(webSqlDriverMock.transaction).toHaveBeenCalled();
    });

    it('should call driver.update if everything is ok and NO transaction is passed by', function() {
        
        var ready = false;
        
        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');

        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction').andCallFake(function(p) {
            var deferred = $q.defer();
            setTimeout(function(){
                deferred.resolve(p());
            },1);
            return deferred.promise;
        });

        runs(function() {
            persistentObject.register('JournalEntry', JournalEntry);
            var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');
            
            persistentObject.update(journal).then(function(){
                ready = true;
            });

        });

        waitsFor(function() {
            $scope.$apply();
            return ready;
        },'waiting for update');

        runs(function() {
            expect(webSqlDriverMock.transaction).toHaveBeenCalled();
            expect(webSqlDriverMock.update).toHaveBeenCalled();
        });

    });

    it('should not update if nothing is passed by', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');
        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction');

        persistentObject.register('JournalEntry', JournalEntry);

        var tryToUpdate = function() {
            persistentObject.update(null);
        };
        expect(tryToUpdate).toThrow('Unknown entity!');
    });

    it('should not update if the entity is not registred by', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');
        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction');

        var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');

        var tryToUpdate = function() {
            persistentObject.update(journal);
        };
        expect(tryToUpdate).toThrow('Unknown entity!');
    });

    it('should not create a transaction if one has been passed by', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');
        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction');

        persistentObject.register('JournalEntry', JournalEntry);

        var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');

        // PersistentStorage.register() calls WebSQLDriver.transaction()...
        expect(webSqlDriverMock.transaction.callCount).toBe(1);

        persistentObject.update(journal, {});

        // Make sure transaction was not called again.
        expect(webSqlDriverMock.transaction.callCount).toBe(1);
    });

    it('should call driver.update if everything is ok and a transaction is passed by', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');
        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction');

        persistentObject.register('JournalEntry', JournalEntry);

        var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');

        persistentObject.update(journal, {});

        expect(webSqlDriverMock.update).toHaveBeenCalled();
    });

    it('should not update if something goes wrong', function() {

        webSqlDriverMock.update = jasmine.createSpy('WebSQLDriver.update');

        webSqlDriverMock.transaction = jasmine.createSpy('WebSQLDriver.transaction').andCallFake(function() {
           return $q.reject();
        });

        persistentObject.register('JournalEntry', JournalEntry);
        var journal = new JournalEntry('i', 'a', 'b', 'c', 'd');

        persistentObject.update(journal);

        expect(webSqlDriverMock.update).not.toHaveBeenCalled();
    });

});
