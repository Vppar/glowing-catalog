'use strict';

describe('Service: Journalservice', function() {
  var replayer = {
    replay : jasmine.createSpy('Replayer.replay')
  };

  var storage = {
    register : jasmine.createSpy('PersistentStorage.register'),
    list : jasmine.createSpy('PersistentStorage.list')
  };

  replayer.replay = jasmine.createSpy('Replayer.replay');

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

  beforeEach(inject(function(_JournalKeeper_, $q, _$rootScope_) {
    JournalKeeper = _JournalKeeper_;
    q = $q;
    $rootScope = _$rootScope_;
  }));

  it('should resync', function() {

    var ready = false;
    var events = [
      'a', 'b', 'z'
    ];

    runs(function() {
      storage.list.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve(events);
        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve('yay');
        return deferred.promise;
      });

      var promise = JournalKeeper.resync();

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
      expect(replayer.replay.callCount).toBe(3);
      for(var ix in events){
        expect(replayer.replay.calls[ix].args[0]).toBe(events[ix]);
      }
    });
  });
  
  it('should succeed on empty list');
  it('should fail to resync on list failure');
  it('should fail to resync on replay failure');

});
