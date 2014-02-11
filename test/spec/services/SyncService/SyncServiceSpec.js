describe('Service: SyncService', function () {

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  var $rootScope = null;
  var $q = null;

  var SyncService = null;
  var JournalEntry = null;

  var SyncDriverMock = {};
  var JournalKeeperMock = {};


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();

      SyncDriverMock.sync = jasmine.createSpy('SyncDriver.sync');

      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced');
      JournalKeeperMock.markAsSynced = jasmine.createSpy('JournalKeeper.markAsSynced');
  });


  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.sync.service');
    module('tnt.catalog.journal.entity');

    module(function ($provide) {
      $provide.value('$log', $log);
      $provide.value('SyncDriver', SyncDriverMock);
      $provide.value('JournalKeeper', JournalKeeperMock);
    });
  });


  beforeEach(inject(function(_$rootScope_, _$q_, _SyncService_, _JournalEntry_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    SyncService = _SyncService_;
    JournalEntry = _JournalEntry_;
  }));



  it('is accessible', function () {
    expect(SyncService).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncService).toBe('object');
  });



  describe('SyncService.sync()', function () {
    var entry1 = {};
    var entry2 = {};
    var entries = {};

    beforeEach(function () {
      // Create some fake entries
      entry1 = new JournalEntry(null, 12345, 'entityCreate', 1, {});
      entry2 = new JournalEntry(null, 67890, 'entityCreate', 1, {});
      entries = [entry1, entry2];
    });

    it('is accessible', function () {
      expect(SyncService.sync).not.toBeUndefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.sync).toBe('function');
    });

    it('gets unsynced entries from journal keeper', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(true));

      expect(JournalKeeperMock.readUnsynced).not.toHaveBeenCalled();
      SyncService.sync();
      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
    });

    it('sends unsynced entries to synchronization driver', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.sync.andCallFake(resolvedPromiseReturner(true));

      SyncService.sync();
      $rootScope.$apply();

      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
      expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
    });

    it('sends entries-to-be-synced back to journal keeper', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.sync.andCallFake(resolvedPromiseReturner(entries));
      JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

      SyncService.sync();
      $rootScope.$apply();

      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
      expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
      for (var idx in entries) {
        expect(JournalKeeperMock.markAsSynced.calls[idx].args[0]).toBe(entries[idx]);
      }
      expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
    });

    it('returns a promise', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.sync.andCallFake(resolvedPromiseReturner(entries));
      JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

      var promise = SyncService.sync();
      $rootScope.$apply();

      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
      expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
      for (var idx in entries) {
        expect(JournalKeeperMock.markAsSynced.calls[idx].args[0]).toBe(entries[idx]);
      }
      expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
      // Check if we return a promise
      expect(typeof promise.then).toBe('function');
      expect(typeof promise['catch']).toBe('function');
      expect(typeof promise['finally']).toBe('function');
    });


    describe('returned promise', function () {
      it('is rejected if failed to get unsynced entries from journal', function () {
        // JournalKeeper.readUnsynced() rejects
        // SyncDriver.sync() is not called
        // JournalKeeper.markAsSynced() is not called
        JournalKeeperMock.readUnsynced.andCallFake(rejectedPromiseReturner('Rejecting JournalKeeper.readUnsynced()'));

        var rejected = false;

        var promise = SyncService.sync();
        promise.then(null, function (err) {
          expect(err).toBe('Rejecting JournalKeeper.readUnsynced()');
          rejected = true;
        });

        $rootScope.$apply();

        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(rejected).toBe(true);
        expect(SyncDriverMock.sync).not.toHaveBeenCalled();
        expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();
      });

      it('is rejected when sync driver fails to sync entries', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() rejects
        // JournalKeeper.markAsSynced() is not called
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.sync.andCallFake(rejectedPromiseReturner('Rejecting SyncDriver.sync()'));

        var resolved = false;
        var rejected = false;

        var promise = SyncService.sync();
        promise.then(function () {
          resolved = true;
        }, function (err) {
          expect(err).toBe('Rejecting SyncDriver.sync()');
          rejected = true;
        });

        $rootScope.$apply();

        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
        expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();

        expect(resolved).toBe(false);
        expect(rejected).toBe(true);
      });

      it('is rejected if journal keeper fails to mark any of the entries as synced', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() resolves
        // One or more JournalKeeper.markAsSynced() rejects
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.sync.andCallFake(resolvedPromiseReturner(entries));
        JournalKeeperMock.markAsSynced.andCallFake(rejectedPromiseReturner('Rejecting JournalKeeper.markAsSynced()'));

        var resolved = false;
        var rejected = false;

        var promise = SyncService.sync();
        promise.then(function () {
          resolved = true;
        }, function (err) {
          expect(err).toBe('Rejecting JournalKeeper.markAsSynced()');
          rejected = true;
        });

        $rootScope.$apply();

        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
        expect(JournalKeeperMock.markAsSynced).toHaveBeenCalled();
        for (var idx in  entries) {
          expect(JournalKeeperMock.markAsSynced.calls[idx].args[0]).toBe(entries[idx]);
        }
        expect(resolved).toBe(false);
        expect(rejected).toBe(true);
      });


      it('is resolved if everything goes well', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() resolves
        // All JournalKeeper.markAsSynced() resolve
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.sync.andCallFake(resolvedPromiseReturner(entries));
        JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

        var rejected = false;
        var resolved = true;

        var promise = SyncService.sync();

        promise.then(function (result) {
          expect(result.length).toBe(2);
          for (var idx in result) {
            expect(result[idx]).toBe(true);
          }
          resolved = true;
        }, function (err) {
          rejected = true;
        });

        $rootScope.$apply();

        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.sync).toHaveBeenCalledWith(entries);
        expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
        expect(resolved).toBe(true);
        expect(rejected).toBe(false);
      });

      it('is resolved if there are no unsynced entries', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() is not called
        // JournalKeeper.markAsSynced() is not called

        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner([]));

        var resolved = false;
        var rejected = false;

        var promise = SyncService.sync();

        promise.then(function () {
          resolved = true;
        }, function (err) {
          rejected = true;
        });

        $rootScope.$apply();

        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.sync).not.toHaveBeenCalled();
        expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();

        expect(resolved).toBe(true);
        expect(rejected).toBe(false);
      });
    });
  }); // SyncService.sync()



  function resolvedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve(result);
      return deferred.promise;
    };
  }

  function rejectedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();
      deferred.reject(result);
      return deferred.promise;
    };
  }
});
