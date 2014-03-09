'use strict';

describe('Service: JournalKeeperReadOldestUnsynced', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      localStorage.deviceId = 1;
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.list = jasmine.createSpy('PersistentStorage.list');

      // Assumes the storage.register() call to have succeeded
      storage.register.andCallFake(function () {
        var deferred = $q.defer();
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
    });
  });

  // instantiate service
  var JournalKeeper = null;
  var JournalEntry = null;
  var $q = null;
  var $rootScope = null;
  var $log = null;

  // $q must be defined before JournalKeeper is loaded
  beforeEach(inject(function (_$q_) {
    $q = _$q_;
  }));

  beforeEach(inject(function(_$log_, _JournalKeeper_, _JournalEntry_, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));


  it('gets oldest unsynced entry from persisted storage', function () {
    var success = false;

    var entry1, entry2;

    entry1 = new JournalEntry(null, new Date().getTime(), 'createFoo', 1, event),
    entry2 = new JournalEntry(null, new Date().getTime(), 'createBar', 1, event),

    spyOn(JournalKeeper, 'readUnsynced').andCallFake(resolvedPromiseReturner([entry1, entry2]));

    runs(function() {
      var promise = JournalKeeper.readOldestUnsynced();

      promise.then(function(result) {
        expect(result).toBe(entry1);
        // Once the promise is resolved, we assume the reading was
        // successful
        $log.debug('Unsynced read!', result);
        success = true;
      }, function (error) {
        $log.debug('Failed to read unsynced!', error);
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return success;
    }, 'JournalKeeper.readOldestUnsynced()');

    runs(function() {
      expect(JournalKeeper.readUnsynced).toHaveBeenCalled();
    });
  });


  function resolvedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();
      setTimeout(function () {
        $log.debug('Resolved promise with result', result);
        deferred.resolve(result);
      }, 0);

      return deferred.promise;
    };
  }

});
