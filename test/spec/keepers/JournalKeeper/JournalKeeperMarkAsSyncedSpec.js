'use strict';

describe('Service: JournalKeeperMarkAsSynced', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.update = jasmine.createSpy('PersistentStorage.update');

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

  // q must be defined before JournalKeeper is injected
  beforeEach(inject(function ($q) {
    q = $q;
  }));

  beforeEach(inject(function(_$log_, _JournalKeeper_, _JournalEntry_, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));


  it('updates the entry in persistent storage', function () {
    var updated = false;
    var entry = new JournalEntry(1, null, null, null, null);

    expect(entry.synced).toBe(0);


    runs(function() {
      storage.update.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve(entry);
        return deferred.promise;
      });

      // Make getTime() return a predictable value
      var getTimeFn = Date.prototype.getTime;
      spyOn(Date.prototype, 'getTime').andReturn(123);

      var promise = JournalKeeper.markAsSynced(entry);

      promise.then(function(entry) {
        // Make sure the synced attr is updated
        expect(entry.synced).toBe(123);

        // Restore getTime()
        Date.prototype.getTime = getTimeFn;

        // Once the promise is resolved, we assume the update was
        // successful
        updated = true;
      });

      $rootScope.$apply();
    });

    waitsFor(function() {
      return updated;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.update).toHaveBeenCalled();
      expect(storage.update).toHaveBeenCalledWith(entry);
    });
  });

  it('logs an error if update fails', function () {
    var failed = true;
    var entry = new JournalEntry(1, null, null, null, null);

    expect(entry.synced).toBe(0);

    runs(function() {
      storage.update.andCallFake(function() {
        var deferred = q.defer();
        deferred.reject('Update failed: PersistentStorage.update failed');
        return deferred.promise;
      });

      var promise = JournalKeeper.markAsSynced(entry);

      promise.then(null, function(err) {
        // FIXME: should we check if entry.synced has been reverted back to false?

        // Once the promise is rejected, assume the update has failed
        failed = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.update).toHaveBeenCalled();
      expect(storage.update).toHaveBeenCalledWith(entry);

      expect($log.error.logs[0]).toEqual([
          'Failed to update journal entry',
          'Update failed: PersistentStorage.update failed'
      ]);
    });
  });

});
