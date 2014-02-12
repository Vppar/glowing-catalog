describe('Service: SyncServiceStashEntries', function () {

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

      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced');
      JournalKeeperMock.remove = jasmine.createSpy('JournalKeeper.remove');
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


  describe('SyncService.stashEntries()', function () {
    var unsyncedEntries = ['foo', 'bar'];

    beforeEach(function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(unsyncedEntries));
      JournalKeeperMock.remove.andCallFake(resolvedPromiseReturner(true));
    });


    it('is accessible', function () {
      expect(SyncService.stashEntries).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.stashEntries).toBe('function');
    });

    it('gets unsynced entries from the journal', function () {
      SyncService.stashEntries();
      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
    });

    it('stores entries in the stash', function () {

      var stashed = false;

      runs(function () {
        SyncService.stashEntries().then(function () {
          stashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return stashed;
      }, 'SyncService.stashEntries()', 100);
      
      runs(function () {
        expect(SyncService.getStashedEntries()).toEqual(unsyncedEntries);
      });
    });

    it('removes entries from the journal', function () {
      var stashed = false;

      runs(function () {
        SyncService.stashEntries().then(function () {
          stashed = true;
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return stashed;
      }, 'SyncService.stashEntries()', 100);
      
      runs(function () {
        expect(JournalKeeperMock.remove.callCount).toBe(2);

        for (var idx in unsyncedEntries) {
          expect(JournalKeeperMock.remove.calls[idx].args[0])
            .toBe(unsyncedEntries[idx]);
        }
      });
    });

    it('returns a promise', function () {
      var result = SyncService.stashEntries();
      expect(typeof result.then).toBe('function');
      expect(typeof result.catch).toBe('function');
      expect(typeof result.finally).toBe('function');
    });
  }); // SyncService.stashEntries()



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
