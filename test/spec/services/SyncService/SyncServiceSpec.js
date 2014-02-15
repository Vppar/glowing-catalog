describe('Service: SyncService', function () {

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
  }));



  it('is accessible', function () {
    expect(SyncService).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncService).toBe('object');
  });



  describe('SyncService.getStashedEntries()', function () {
    var originalStash = ['foo', 'bar'];

    it('is accessible', function () {
      expect(SyncService.getStashedEntries).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.getStashedEntries).toBe('function');
    });

    it('returns an emtpy array if there\'s no stash', function () {
      // By default, stash is null when the module is loaded.
      expect(SyncService.getStashedEntries()).toEqual([]);
    });

    it('returns a shallow copy of the stash', function () {
      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced')
        .andCallFake(resolvedPromiseReturner(originalStash));

      JournalKeeperMock.remove = jasmine.createSpy('JournalKeeper.remove')
        .andCallFake(resolvedPromiseReturner(true));
      
      var stashed = false;

      runs(function () {
        var promise = SyncService.stashEntries();
        promise.then(function () {
          stashed = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return stashed;
      }, 'SyncService.stashEntries()', 200);

      runs(function () {
        var stash1 = SyncService.getStashedEntries();
        var stash2 = SyncService.getStashedEntries();

        // The returned value MUST not be the same array returned
        // by readOldestUnsynced()
        expect(stash1).not.toBe(originalStash);
        expect(stash1).toEqual(originalStash);

        // Running getStashedEntries() multiple times, should always
        // return a new array (prevent others from getting access to the
        // original stash array).
        expect(stash1).not.toBe(stash2);
        expect(stash1).toEqual(stash2);
      });
    });
  });



  function resolvedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();

      setTimeout(function () {
        $log.debug('Promise resolved with result', result);
        deferred.resolve(result);
      }, 0);

      return deferred.promise;
    };
  }

  function rejectedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();

      setTimeout(function () {
        $log.debug('Promise rejected with result', result);
        deferred.reject(result);
      }, 0);

      return deferred.promise;
    };
  }
});
