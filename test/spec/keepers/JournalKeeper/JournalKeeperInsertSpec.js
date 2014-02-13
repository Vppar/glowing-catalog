'use strict';

describe('Service: JournalKeeperInsert', function() {
  var replayer = {};
  var storage = {};

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

  it('should insert the entry', function () {
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

      var promise = JournalKeeper.insert(entry);

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


  it('should fail to insert on a wrong instance type', function () {
    var failed = false;

    runs(function() {
      var promise = JournalKeeper.insert({});

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


  it('should fail to insert on storage.persist failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();
        deferred.reject('Failed PersistentStorage.persist');
        return deferred.promise;
      });

      var promise = JournalKeeper.insert(entry);

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
  // when the replay fails. See JounralKeeper.insert().
  it('should fail to insert on replay failure', function () {
    var failed = false;

    runs(function() {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });

      replayer.replay.andCallFake(function() {
        throw 'Failed Replayer.replay';
      });

      var promise = JournalKeeper.insert(entry);

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
        deferred.reject('Failed PersistentStorage.persist');
        return deferred.promise;
      });

      var promise = JournalKeeper.insert(entry);

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
        deferred.resolve();
        return deferred.promise;
      });

      replayer.replay.andCallFake(function () {
          throw 'Failed Replayer.replay';
      });

      var promise = JournalKeeper.insert(entry);

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

  it('updates sequence value if entry\'s value is higher than current sequence', function () {
    expect(JournalKeeper.getSequence()).toBe(0);

    var inserted = false;

    entry.sequence = 5;

    runs(function () {
      storage.persist.andCallFake(function() {
        var deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      });

      var promise = JournalKeeper.insert(entry);

      promise.then(function () {
        inserted = true;
      }, function (err) {
        $log.debug('Failed to insert entry!', entry);
      });

      $rootScope.$apply();
    });

    waitsFor(function () {
      return inserted;
    }, 'JournalKeeper.insert()', 100);


    runs(function () {
      expect(JournalKeeper.getSequence()).toBe(5);
    });
  });

  it('does not update sequence value if entry\'s value is lower than current sequence', function () {
    storage.persist.andCallFake(function() {
      var deferred = q.defer();
      deferred.resolve();
      return deferred.promise;
    });

    expect(JournalKeeper.getSequence()).toBe(0);

    var higherSequenceValue = 10;
    var lowerSequenceValue = 5;

    var inserted1 = false;
    var inserted2 = false;


    // Insert an entry to update the sequence value
    runs(function () {
      var newEntry = new JournalEntry(higherSequenceValue, new Date().getTime(), 'createFoo', 1, event);

      var promise = JournalKeeper.insert(newEntry);

      promise.then(function () {
        expect(JournalKeeper.getSequence()).toBe(higherSequenceValue);
        inserted1 = true;
      }, function (err) {
        $log.debug('Failed to insert entry!', err, entry);
      });

      $rootScope.$apply();
    });

    waitsFor(function () {
      return inserted1;
    }, 'JournalKeeper.insert()', 100);


    // Insert an entry with lower sequence value
    runs(function () {
      // Set entry's sequence to a lower value than current sequence
      entry.sequence = lowerSequenceValue;
      var promise = JournalKeeper.insert(entry);

      promise.then(function () {
        // Make sure sequence value was not updated by the lowest value
        expect(JournalKeeper.getSequence()).toBe(higherSequenceValue);
        inserted2 = true;
      }, function (err) {
        $log.debug('Failed to insert entry!', err, entry);
      });

      $rootScope.$apply();
    });

    waitsFor(function () {
      return inserted2;
    }, 'JournalKeeper.insert()', 100);
  });
});
