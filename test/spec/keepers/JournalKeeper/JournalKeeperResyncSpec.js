'use strict';

describe('Service: JournalKeeperResync', function() {
  var replayer = {};
  var storage = {};

  beforeEach(function () {
      replayer.replay = jasmine.createSpy('Replayer.replay');
      replayer.nukeKeepers = jasmine.createSpy('Replayer.nukeKeepers');

      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.list = jasmine.createSpy('PersistentStorage.list');

      // Assumes the storage.register() call to have succeeded
      storage.register.andCallFake(function () {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });
  });


  // load the service's module
  beforeEach(function() {
    module('tnt.catalog.journal');

    module(function($provide) {
      $provide.value('Replayer', replayer);
      $provide.value('PersistentStorage', function() {
        return storage;
      });
      // $provide.value('$log', {debug: console.log});
    });
  });

  // instantiate service
  var JournalKeeper = null;
  var q = null;
  var $rootScope = null;
  var $log = null;
  var JournalEntry = null;

  // q must be defined before JournalKeeper is injected
  beforeEach(inject(function ($q) {
    q = $q;
  }));

  beforeEach(inject(function(_$log_, _JournalKeeper_, _$rootScope_, _JournalEntry_) {
    JournalKeeper = _JournalKeeper_;
    $rootScope = _$rootScope_;
    $log = _$log_;
    JournalEntry = _JournalEntry_;
    
  }));


  it('should resync', function() {
    var ready = false;
    var events = [
      {}, {}, {}
    ];

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve(events);
        }, 0);
        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
          // Replay should have worked unless it throws an exception
          return true;
      });

      var promise = JournalKeeper.resync();

      promise.then(function() {
        // Once the promise is resolved, we assume the resync was
        // successful.
        ready = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return ready;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.list).toHaveBeenCalled();
      expect(replayer.replay.callCount).toBe(3);
      for(var ix in events){
        expect(replayer.replay.calls[ix].args[0]).toEqual(events[ix]);
      }
    });
  });
  

  it('should succeed on empty list', function () {
    var ready = false;
    var events = [];

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve(events);
        }, 0);
        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
          // Replay should be successfull unless it throws an exception
          return true;
      });

      var promise = JournalKeeper.resync();

      // Successfull resync
      promise.then(function() {
        ready = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return ready;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.list).toHaveBeenCalled();
      expect(replayer.replay).not.toHaveBeenCalled();
    });
  });


  it('should fail to resync on storage.list failure', function () {
    var failed = false;

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.reject('Failed PersistentStorage.list');
        }, 0);
        return deferred.promise;
      });

      var promise = JournalKeeper.resync();

      // Failed resync
      promise.then(null, function(msg) {
        failed = true;
        var logDebugArgs = $log.debug.logs[1];
        expect(logDebugArgs[0]).toBe('Failed to resync: list failed');
        expect(logDebugArgs[1]).toBe('Failed PersistentStorage.list');
        // Probably not needed to test this, but better safe than sorry
        expect(msg).toBe('Failed PersistentStorage.list');
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.list).toHaveBeenCalled();
      expect(replayer.replay).not.toHaveBeenCalled();
    });
  });


  it('should fail to resync on replay failure', function () {
    var failed = false;
    var events = [
      {},{},{}
    ];

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve(events);
        }, 0);
        return deferred.promise;
      });

      replayer.replay.andCallFake(function () {
          throw 'Failed Replayer.replay';
      });

      var promise = JournalKeeper.resync();

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
      expect(storage.list).toHaveBeenCalled();
      expect(replayer.replay).toHaveBeenCalled();
    });
  });

});
