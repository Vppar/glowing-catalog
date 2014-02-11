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


  describe('SyncService.insert()', function () {
    it('is accessible', function () {
      expect(SyncService.insert).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.insert).toBe('function');
    });

    it('inserts the entry in the journal', function () {
      var entry = new JournalEntry(5, new Date().getTime(), 'createFoo', 1, {});

      JournalKeeperMock.insert.andCallFake(resolvedPromiseReturner(true));
      JournalKeeperMock.getSequence.andReturn(1);

      var inserted = false;

      runs(function () {
        var promise = SyncService.insert(entry);
        promise.then(function () {
          inserted = true;
        }, function (err) {
          $log.debug('Failed to insert entry!', err, entry);
        });

        $rootScope.$apply();
      });

      waitsFor(function () {
        return inserted;
      }, 'SyncService.insert()', 100);

      runs(function () {
        expect(JournalKeeperMock.insert).toHaveBeenCalledWith(entry);
      });
    });
  }); // SyncService.insert()



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
