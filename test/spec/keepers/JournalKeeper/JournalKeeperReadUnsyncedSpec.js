'use strict';

describe('Service: JournalKeeperReadUnsynced', function() {
  var replayer = {};
  var storage = {};


  beforeEach(function () {
      storage.register = jasmine.createSpy('PersistentStorage.register');
      storage.list = jasmine.createSpy('PersistentStorage.list');
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


  // Making sure all entries are unsynced should be done in
  // WebSQLDriver or PersistentStorage tests (not sure in which one).
  it('gets unsynced entries from PersistentStorage', function () {
    var success = false;

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });

      var promise = JournalKeeper.readUnsynced();

      promise.then(function() {
        // Once the promise is resolved, we assume the reading was
        // successful
        success = true;
      });
    });

    waitsFor(function() {
      $rootScope.$apply();
      return success;
    }, 'Resync seems to have failed');

    runs(function() {
      expect(storage.list).toHaveBeenCalled();
      expect(storage.list).toHaveBeenCalledWith('JournalEntry', {synced : false});
    });
  });

});
