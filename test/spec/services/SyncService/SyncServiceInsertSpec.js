describe('Service: SyncServiceInsertSpec', function () {

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

      JournalKeeperMock.insert = jasmine.createSpy('JournalKeeper.insert');
      JournalKeeperMock.getSequence = jasmine.createSpy('JournalKeeper.getSequence');
      JournalKeeperMock.findEntry = jasmine.createSpy('JournalKeeper.findEntry');
      JournalKeeperMock.setSequence = jasmine.createSpy('JournalKeeper.setSequence');
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

    PromiseHelper.config($q, $log.debug);
  }));


  describe('SyncService.insert()', function () {
    it('is accessible', function () {
      expect(SyncService.insert).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.insert).toBe('function');
    });

    it('inserts the entry in the journal', function () {
      var entry = new JournalEntry(5, new Date().getTime(), 'createFoo', 1, {});

      JournalKeeperMock.insert.andCallFake(PromiseHelper.resolved(true));
      JournalKeeperMock.getSequence.andReturn(1);

      var inserted = false;

      runs(function () {
        var promise = SyncService.insert(entry);
        promise.then(function () {
          inserted = true;
        }, function (err) {
          $log.debug('Failed to insert entry!', err, entry);
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return inserted;
      }, 'SyncService.insert()', 100);

      runs(function () {
        expect(JournalKeeperMock.insert).toHaveBeenCalledWith(entry);
      });
    });


    describe('existing local entry', function () {
      var receivedEntry = null;

      var sequenceNumber = 5;
      var conflictingNumber = 4;

      beforeEach(function () {
        var timestamp = new Date().getTime();

        // Two entries should be equal but not the same
        receivedEntry = new JournalEntry(conflictingNumber, timestamp, 'createFoo', 1, {});
        foundEntry = new JournalEntry(conflictingNumber, timestamp, 'createFoo', 1, {});

        JournalKeeperMock.getSequence.andReturn(sequenceNumber);
        JournalKeeperMock.findEntry.andCallFake(PromiseHelper.resolved(foundEntry));

        spyOn(SyncService, 'stashEntries').andCallFake(PromiseHelper.resolved(true));
        spyOn(SyncService, 'unstashEntries').andCallFake(PromiseHelper.resolved(true));
      });

      it('does not inserts the received entry in the journal', function () {
        var resolved = false;

        runs(function () {
            SyncService.insert(receivedEntry).then(function () {
                resolved = true;
            });
        });

        waitsFor(function () {
            $rootScope.$apply();
            return resolved;
        }, 'SyncService.insert()');

        runs(function () {
            expect(JournalKeeperMock.insert).not.toHaveBeenCalled();
        });
      });
    });


    describe('conflicting sequence number', function () {
      var receivedEntry = null;

      var sequenceNumber = 5;
      var conflictingNumber = 4;

      beforeEach(function () {
        receivedEntry = new JournalEntry(conflictingNumber, new Date().getTime(), 'createFoo', 1, {});
        existingEntry = new JournalEntry(conflictingNumber, new Date().getTime() - 10, 'createFoo', 1, {});

        receivedEntry.synced = new Date().getTime();
        existingEntry.synced = new Date().getTime() - 1000;

        JournalKeeperMock.getSequence.andReturn(sequenceNumber);
        JournalKeeperMock.insert.andCallFake(PromiseHelper.resolved(true));
        JournalKeeperMock.findEntry.andCallFake(PromiseHelper.resolved(existingEntry));

        spyOn(SyncService, 'stashEntries').andCallFake(PromiseHelper.resolved(true));
        spyOn(SyncService, 'unstashEntries').andCallFake(PromiseHelper.resolved(true));
      });

      it('stashes the unsynced entries', function () {
        var resolved = false;

        runs(function () {
          var promise = SyncService.insert(receivedEntry);
          promise.then(function () {
            resolved = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved;
        }, 'SyncService.insert()', 100);

        runs(function () {
          expect(SyncService.stashEntries).toHaveBeenCalled();
        });
      });

      it('inserts the received entry', function () {
        var resolved = false;

        runs(function () {
          var promise = SyncService.insert(receivedEntry);
          promise.then(function () {
            resolved = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved;
        }, 'SyncService.insert()', 100);

        runs(function () {
          expect(JournalKeeperMock.insert).toHaveBeenCalledWith(receivedEntry);
        });
      });

      it('unstashes the stashed entries', function () {
        var resolved = false;

        runs(function () {
          var promise = SyncService.insert(receivedEntry);
          promise.then(function () {
            resolved = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved;
        }, 'SyncService.insert()', 100);

        runs(function () {
          expect(SyncService.unstashEntries).toHaveBeenCalled();
        });
      });

      it('returns a promise', function () {
        var promise = SyncService.insert(receivedEntry);
        expect(typeof promise.then).toBe('function');
        expect(typeof promise['catch']).toBe('function');
        expect(typeof promise['finally']).toBe('function');
      });
    }); // conflicting sequence number
  }); // SyncService.insert()

});
