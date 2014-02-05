'use strict';

describe('Service: JournalKeeperMarkAsSynced', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.update = jasmine.createSpy('PersistentStorage.update');
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

  beforeEach(inject(function($q, _$log_, _JournalKeeper_, _JournalEntry_, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    q = $q;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));


  it('updates the entry with PersistentStorage', function () {
    var updated = false;
    var entry = new JournalEntry(1, null, null, null, null);

    expect(entry.synced).toBe(false);


    runs(function() {
      storage.update.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve(entry);
        return deferred.promise;
      });

      var promise = JournalKeeper.markAsSynced(entry);

      promise.then(function(entry) {
        // Make sure the synced attr is updated
        expect(entry.synced).toBe(true);

        // Once the promise is resolved, we assume the update was
        // successful
        updated = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return updated;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.update).toHaveBeenCalled();
      expect(storage.update).toHaveBeenCalledWith(entry);
    });
  });

  it('logs an error if PersistentStorage.update fails', function () {
    var failed = true;
    var entry = new JournalEntry(1, null, null, null, null);

    expect(entry.synced).toBe(false);

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
