'use strict';

describe('Service: JournalKeeperReadUnsynced', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
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
  var $q = null;
  var $rootScope = null;
  var $log = null;

  // $q must be defined before JournalKeeper is loaded
  beforeEach(inject(function (_$q_) {
    $q = _$q_;
  }));

  beforeEach(inject(function(_$log_, _JournalKeeper_, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    $rootScope = _$rootScope_;
    $log = _$log_;
  }));


  // Making sure all entries are unsynced should be done in
  // WebSQLDriver or PersistentStorage tests (not sure in which one).
  it('gets unsynced entries from persisted storage', function () {
    var success = false;

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = $q.defer();
        setTimeout(function () {
          deferred.resolve();
        }, 0);
        return deferred.promise;
      });

      var promise = JournalKeeper.readUnsynced();

      promise.then(function(result) {
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
    }, 'JournalKeeper.readUnsynced()');

    runs(function() {
      expect(storage.list).toHaveBeenCalled();
      expect(storage.list).toHaveBeenCalledWith('JournalEntry', {synced : 0});
    });
  });

});
