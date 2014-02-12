describe('Service: SyncServiceUnstashEntries', function () {

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

  // Some fake entries that we want to stash
  var stashedEntries = ['foo', 'bar'];

  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();

      JournalKeeperMock.compose = jasmine.createSpy('JournalKeeper.compose');

      // We'll use this to insert entries in the stash
      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced')
        .andCallFake(resolvedPromiseReturner(stashedEntries));
      JournalKeeperMock.remove = jasmine.createSpy('JournalKeeper.remove')
        .andCallFake(resolvedPromiseReturner(true));
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


  describe('SyncService.unstashEntries()', function () {

    it('is accessible', function () {
      expect(SyncService.unstashEntries).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.unstashEntries).toBe('function');
    });

    it('composes all stashed entries', function () {
      var stashed = false;
      var unstashed = false;

      // Stash some fake entries
      runs(function () {
        var promise = SyncService.stashEntries();
        promise.then(function () {
          stashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return stashed;
      }, 'SyncService.stashEntries()', 100);

      // Unstash those entries
      runs(function () {
        var promise = SyncService.unstashEntries();
        promise.then(function () {
          unstashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return unstashed;
      }, 'SyncService.unstashEntries', 100);

      runs(function () {
        expect(JournalKeeperMock.compose.callCount).toBe(2);
        for (var idx in  stashedEntries) {
          expect(JournalKeeperMock.compose.calls[idx].args[0]).toBe(stashedEntries[idx]);
        }
      });
    });


    it('clears the stash', function () {
      var stashed = false;
      var unstashed = false;

      // Stash some fake entries
      runs(function () {
        var promise = SyncService.stashEntries();
        promise.then(function () {
          stashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return stashed;
      }, 'SyncService.stashEntries()', 100);


      // Unstash our fake entries
      runs(function () {
        // Check that the entries are in the stash
        expect(SyncService.getStashedEntries().length).toBe(2);

        var promise = SyncService.unstashEntries();

        promise.then(function () {
          unstashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return unstashed;
      }, 'SyncService.unstashEntries', 100);

      runs(function () {
        // Make sure the stash was cleared
        expect(SyncService.getStashedEntries().length).toBe(0);
      });
    });

    // FIXME: implement these tests
    it('returns a promise');
    it('returns a resolved promise if there\'s nothing in the stash');
  }); // SyncService.unstashEntries()



  function resolvedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();
      deferred.resolve(result);
      return deferred.promise;
    }
  }

  function rejectedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();
      deferred.reject(result);
      return deferred.promise;
    }
  }
});
