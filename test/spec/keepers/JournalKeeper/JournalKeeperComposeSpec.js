'use strict';

describe('Service: JournalKeeperCompose', function() {
  var replayer = {};
  var storage = {};
  var SyncServiceMock = {};

  // load the service's module
  beforeEach(function() {
    module('tnt.util.log');
    module('tnt.catalog.journal');

    module(function($provide) {
      $provide.value('Replayer', replayer);
      $provide.value('PersistentStorage', function() {
        return storage;
      });
      // $provide.value('$log', {debug: console.log});
    });
  });
  
  beforeEach(inject(function ($q, $rootScope) {
    replayer.replay = jasmine.createSpy('Replayer.replay');
    storage.register = jasmine.createSpy('PersistentStorage.register').andCallFake(function(){
      var deferred = $q.defer();
      
      setTimeout(function(){
        deferred.resolve();
        $rootScope.$apply();
      }, 0);
      
      return deferred.promise;
    });
    storage.persist = jasmine.createSpy('PersistentStorage.persist');
    SyncServiceMock.sync = jasmine.createSpy('SyncService.sync');
  }));

  // instantiate service
  var JournalKeeper;
  var JournalEntry;
  var q;
  var $rootScope;
  var $log;
  var entry;
  var event;

  beforeEach(inject(function(_$log_, _JournalKeeper_, $q, _$rootScope_, _JournalEntry_) {
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    q = $q;
    $rootScope = _$rootScope_;
    $log = _$log_;

    event = {};

    entry = new JournalEntry(1, new Date().getTime(), 'createFoo', 1, event);
  }));

  it('should compose', function () {
    var ready = false;

    runs(function() {
      storage.persist.andCallFake(function(journalEntry) {
        var deferred = q.defer();
        expect(journalEntry).toBe(entry);
        deferred.resolve();
        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
          // As long as it doesn't throw an exception, replay should ok.
          return true;
      });

      var promise = JournalKeeper.compose(entry);

      promise.then(function() {
        ready = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return ready;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.persist).toHaveBeenCalled();
      expect(replayer.replay.callCount).toBe(1);
    });
  });


  it('should fail to compose on a wrong instance type', function () {
    var failed = false;

    runs(function() {
      var promise = JournalKeeper.compose({});

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        expect(msg).toBe('the given entry is not an instance of JournalEntry');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.persist).not.toHaveBeenCalled();
      expect(replayer.replay).not.toHaveBeenCalled();
    });
  });


  it('should fail to compose on storage.persist failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();

        setTimeout(function () {
          deferred.reject('Failed PersistentStorage.persist');
        }, 0);

        return deferred.promise;
      });

      var promise = JournalKeeper.compose(entry);

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        expect(msg).toBe('Failed PersistentStorage.persist');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.persist).toHaveBeenCalled();
      expect(replayer.replay).not.toHaveBeenCalled();
    });
  });


  // FIXME: there's no garantee that an entry is not persisted
  // when the replay fails. See JounralKeeper.compose().
  it('should fail to compose on replay failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();

        setTimeout(function () {
          deferred.resolve();
        }, 0);

        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
        throw 'Failed Replayer.replay';
      });

      var promise = JournalKeeper.compose(entry);

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        expect(msg).toBe('Failed Replayer.replay');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.persist).toHaveBeenCalled();
      expect(replayer.replay).toHaveBeenCalled();
    });
  });


  it('should log a fatal on persist failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();

        setTimeout(function () {
          deferred.reject('Failed PersistentStorage.persist');
        }, 0);

        return deferred.promise;
      });

      var promise = JournalKeeper.compose(entry);

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        expect(msg).toBe('Failed PersistentStorage.persist');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect($log.error.logs[0][0]).toBe('Failed to compose: PersistentStorage.persist failed');
      expect(storage.persist).toHaveBeenCalled();
    });
  });


  it('should log a fatal on replay failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve();
        }, 0);
        return deferred.promise;
      });

      replayer.replay.andCallFake(function () {
          throw 'Failed Replayer.replay';
      });

      var promise = JournalKeeper.compose(entry);

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        expect(msg).toBe('Failed Replayer.replay');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect($log.fatal.logs[0][0]).toBe('Failed to replay: Replayer.replay failed');
      expect(storage.persist).toHaveBeenCalled();
      expect(replayer.replay).toHaveBeenCalled();
    });
  });


  it('increments the sequence value by 1', function () {
    expect(JournalKeeper.getSequence()).toBe(1);

    var composed = false;

    runs(function () {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve();
        }, 0);
        return deferred.promise;
      });

      var promise = JournalKeeper.compose(entry);

      promise.then(function () {
        composed = true;
      }, function (err) {
        $log.debug('Failed to compose entry!', entry);
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return composed;
    }, 'JournalKeeper.compose()', 100);


    runs(function () {
      expect(JournalKeeper.getSequence()).toBe(2);
    });
  });
});
