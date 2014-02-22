'use strict';

describe('Service: JournalKeeperRemove', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      localStorage.deviceId = 1;
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.remove = jasmine.createSpy('PersistentStorage.remove');

      // Assumes the storage.register() call to have succeeded
      storage.register.andCallFake(function () {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });
  });


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

  // instantiate service
  var JournalKeeper = null;
  var JournalEntry = null;
  var q = null;
  var $rootScope = null;
  var $log = null;

  // q must be defined before JournalKeeper is loaded
  beforeEach(inject(function ($q) {
    q = $q;
  }));


  beforeEach(inject(function(_$log_, _JournalKeeper_, _JournalEntry_, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));



  it('removes the given entry using PersistentStorage', function () {
    var removed = false;
    var entry = new JournalEntry(1, null, null, null, null);

    runs(function() {
      storage.remove.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.resolve(entry);
        }, 0);
        return deferred.promise;
      });

      var promise = JournalKeeper.remove(entry);

      promise.then(function(journalEntry) {
        // FIXME: do we need to test if the promise's callback receives
        // the removed journal entry?

        // Once the promise is resolved, we assume the removal was
        // successful
        removed = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return removed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.remove).toHaveBeenCalled();
      expect(storage.remove).toHaveBeenCalledWith(entry);
    });
  });

  it('logs an error if removing an entry fails', function () {
    var failed = false;
    var entry = new JournalEntry(1, null, null, null, null);

    runs(function() {
      storage.remove.andCallFake(function() {
        var deferred = q.defer();
        setTimeout(function () {
          deferred.reject('Removal failed: PersistentStorage.remove failed');
        }, 0);
        return deferred.promise;
      });

      var promise = JournalKeeper.remove(entry);

      promise.then(null, function(err) {
        // Once the promise is rejected, assume the removal has failed
        failed = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.remove).toHaveBeenCalled();
      expect(storage.remove).toHaveBeenCalledWith(entry);

      expect($log.error.logs[0]).toEqual([
          'Failed to remove journal entry',
          'Removal failed: PersistentStorage.remove failed'
      ]);
    });
  });
});
