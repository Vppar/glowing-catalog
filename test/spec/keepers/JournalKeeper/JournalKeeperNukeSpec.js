'use strict';

describe('Service: JournalKeeperNuke', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.nuke = jasmine.createSpy('PersistentStorage.nuke');
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
  var q = null;
  var $rootScope = null;
  var $log = null;

  beforeEach(inject(function(_$log_, _JournalKeeper_, $q, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    q = $q;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));


  it('clears journal entries from persistent storage', function () {
    var nuked = false;

    runs(function() {
      storage.nuke.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });

      var promise = JournalKeeper.nuke();

      promise.then(function() {
        // Once the promise is resolved, we assume the nuke was
        // successful
        nuked = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return nuked;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.nuke).toHaveBeenCalled();
      expect(storage.nuke).toHaveBeenCalledWith('JournalEntry');
    });
  });


  it('logs a fatal if nuke fails', function () {
    var failed = false;

    runs(function() {
      storage.nuke.andCallFake(function() {
        var deferred = q.defer();
        deferred.reject('Failed PersistentStorage.nuke');
        return deferred.promise;
      });

      var promise = JournalKeeper.nuke();

      promise.then(null, function(msg) {
        // Once the promise is rejected, we assume the nuke has failed
        expect(msg).toBe('Failed PersistentStorage.nuke');
        failed = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return failed;
    }, 'Resync seems to have failed');

    runs(function() {
      expect($log.fatal.logs[0][0]).toBe('Failed to nuke journal entries: PersistentStorage.nuke failed');
    });
  });


});
