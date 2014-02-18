describe('Service: SyncServiceSync', function () {

  var showLog = false;

  var logger = showLog ? console.log : angular.noop;

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

      SyncDriverMock.save = jasmine.createSpy('SyncDriver.save');

      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced');
      JournalKeeperMock.readOldestUnsynced = jasmine.createSpy('JournalKeeper.readOldestUnsynced');
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

    // Reduce the number of attempts during tests
    SyncService.MAX_SYNC_ATTEMPTS = 2;

    PromiseHelper.config($q, $log.debug);
  }));



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

    it('has the MAX_SYNC_ATTEMPTS config set', function () {
      expect(SyncService.MAX_SYNC_ATTEMPTS).toBeDefined();
      expect(SyncService.MAX_SYNC_ATTMEPTS).not.toBe(0);
    });

    it('flags the service as syncing', function () {
      // Resolving/rejecting doesn't matter for this test.
      JournalKeeperMock.readOldestUnsynced.andCallFake(PromiseHelper.rejected());

      expect(SyncService.isSynching()).toBe(false);
      SyncService.sync();
      expect(SyncService.isSynching()).toBe(true);
    });

    describe('happy day', function () {
      beforeEach(function () {
        var count = 0;

        // A helper function that simulates the expected behavior for
        // the readOldesUnsynced() method when used within the sync()
        // method in a happy-day scenario (each call returns a new
        // entry until the list is exhausted).
        function getNextEntry() {
          var entry = entries[count++];
          return PromiseHelper.resolved(entry || null)();
        }

        JournalKeeperMock.readOldestUnsynced
          .andCallFake(getNextEntry);

        JournalKeeperMock.markAsSynced
          .andCallFake(PromiseHelper.resolved(true));

        SyncDriverMock.save
          .andCallFake(PromiseHelper.resolved(true));


        var synched = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(function () {
            $log.debug('Synced all entries!');
            synched = true;
          }, function (err) {
            $log.debug('Failed to sync entries!', err);
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return synched;
        }, 'SyncService.sync()');
      });

      it('gets the oldest unsynced entry from the journal keeper', function () {
        expect(JournalKeeperMock.readOldestUnsynced.callCount).toBe(3);
      });

      it('sends the entry to the sync driver', function () {
        // Expect SyncDriver to have been called once for each entry
        expect(SyncDriverMock.save.callCount).toBe(2);
        for (var idx in entries) {
          expect(SyncDriverMock.save.calls[idx].args[0]).toBe(entries[idx]);
        }
      });

      it('marks the entry as synced', function () {
        // Expect SyncDriver to have been called once for each entry
        expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
        for (var idx in entries) {
          expect(JournalKeeperMock.markAsSynced.calls[idx].args[0])
            .toEqual(entries[idx]);
        }
      });

      it('removes the syncing flag from the service when done', function () {
        expect(SyncService.isSynching()).toBe(false);
      });
    }); // happy way


    describe('fail to get unsynced entries', function () {
      beforeEach(function () {
        JournalKeeperMock.readOldestUnsynced
          .andCallFake(PromiseHelper.rejected('Rejected by mock!'));

        var failed = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(null, function (err) {
            $log.debug('Failed to sync entries!', err);
            failed = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return failed;
        }, 'SyncService.sync()');
      });

      it('logs an error', function () {
        expect($log.fatal).toHaveBeenCalled();
      });

      it('removes the syncing flag from the service', function () {
        expect(SyncService.isSynching()).toBe(false);
      });

      it('makes MAX_SYNC_ATTEMPTS attempts to sync', function () {
        expect(JournalKeeperMock.readOldestUnsynced.callCount).toBe(1);
        expect($log.fatal).toHaveBeenCalled();
      });
    }); // failing to get unsynced entries


    describe('fail to sync with server', function () {
      beforeEach(function () {
        $rootScope.$apply();
      });

      beforeEach(function () {
        JournalKeeperMock.readOldestUnsynced
          .andCallFake(PromiseHelper.resolved(entry1));

        SyncDriverMock.save
          .andCallFake(PromiseHelper.rejected('Rejected by mock!'));

        var failed = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(null, function (err) {
            failed = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return failed;
        }, 'SyncService.sync()');
      });

      it('logs an error', function () {
        expect($log.error).toHaveBeenCalled();
      });

      it('removes the syncing flag from the service', function () {
        expect(SyncService.isSynching()).toBe(false);
      });

      it('makes MAX_SYNC_ATTEMPTS attempts to sync', function () {
        expect(SyncDriverMock.save.callCount).toBe(SyncService.MAX_SYNC_ATTEMPTS);
        expect($log.fatal).toHaveBeenCalled();
      });
    }); // fail to sync with server


    describe('fail to mark as synced', function () {
      beforeEach(function () {
        JournalKeeperMock.readOldestUnsynced
          .andCallFake(PromiseHelper.resolved(entry1));

        SyncDriverMock.save
          .andCallFake(PromiseHelper.resolved(true));

        JournalKeeperMock.markAsSynced
          .andCallFake(PromiseHelper.rejected('Rejected by mock!'));

        var failed = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(null, function (err) {
            failed = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return failed;
        }, 'SyncService.sync()');
      });

      it('logs a fatal failure!');
      it('removes the syncing flag from the service');

      it('makes MAX_SYNC_ATTEMPTS attempts to sync', function () {
        expect(JournalKeeperMock.markAsSynced.callCount).toBe(1);
        expect($log.fatal).toHaveBeenCalled();
      });
    }); // fail to mark as synced

  }); // SyncService.sync()
});
