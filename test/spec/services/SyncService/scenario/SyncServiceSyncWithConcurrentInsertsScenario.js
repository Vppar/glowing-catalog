
// This scenario should test the case of two devices signed in with
// the same user trying to sync different entries at the same time.
ddescribe('SyncService.sync() with concurrent .insert()s', function () {
  'use strict';

  var FIREBASE_USER_DATA_LOCATION = 'voppwishlist.firebaseio.com/users/test@fake_acc/journal';
  var FIREBASE_USERNAME = 'test@fake.acc';
  var FIREBASE_PASSWORD = 'senha123';

  var logger = angular.noop;
  var logger = console.log;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };


  var SyncDriver = null;
  var SyncService = null;
  var WebSQLDriver = null
  var JournalKeeper = null;
  var JournalEntry = null;
  var PersistentStorage = null;
  var IdentityService = null;

  var $q = null;
  var $rootScope = null;

  beforeEach(loadModules);
  beforeEach(inject(injectDependencies));
  beforeEach(createSpies);

  var journalRef = new Firebase(FIREBASE_USER_DATA_LOCATION);

  var syncedEntries = [];
  var remoteEntries = [];

  // Stores all entries received from firebase
  var receivedEntries = [];

  var syncedEntry1, syncedEntry2, syncedEntry3;
  var remoteEntry1, remoteEntry2, remoteEntry3;


  beforeEach(createDirectConnection);
  beforeEach(nukeRemoteData);
  beforeEach(nukeLocalData);
  beforeEach(createEntries);
  beforeEach(persistLocallyForSync);
  beforeEach(listenForReceivedEntries);
  beforeEach(createSyncDriverConnection);
  beforeEach(waitForSynchronization);

  it('receives expected entries', function () {
    // sequences should be ordered form lowest to highest
    // sequences MUST NOT be duplicated
    // entry types MUST NOT be duplicated
    // entry uuids MUST NOT be duplicated

    var sequences = [];
    var types = [];
    var uuids = [];

    for (var idx in receivedEntries) {
      var entry = receivedEntries[idx];

      // Expect entries to be received in the right order
      expect(sequences[sequence.length - 1] < entry.sequence).toBe(true);

      // Check uniqueness
      expect(~sequences.indexOf(entry.sequence)).toBe(0);
      expect(~types.indexOf(entry.type)).toBe(0);
      expect(~uuids.indexOf(entry.uuid)).toBe(0);

      // Update arrays
      sequences.push(entry.sequence);
      types.push(entry.type);
      uuids.push(entry.uuid);
    }
  });


  ////////////////
  function createSpies() {
      $log.debug('===', 'createSpies()');
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
      $log.debug('Spies created');
  };


  function loadModules() {
    $log.debug('===', 'loadModules()');
    module('tnt.catalog.sync.driver');
    module('tnt.catalog.sync.service');
    module('tnt.storage.websql');
    module('tnt.catalog.storage.persistent');
    module('tnt.catalog.journal.keeper');
    module('tnt.catalog.journal.entity');
    module('tnt.catalog.journal.replayer');
    module('tnt.identity');

    module(function ($provide) {
      $provide.value('$log', $log);
    });
    $log.debug('Modules loaded');
  };



  function injectDependencies(_$rootScope_, _$q_, _SyncDriver_, _SyncService_, _WebSQLDriver_, _JournalKeeper_, _JournalEntry_, _PersistentStorage_, _IdentityService_) {
    $log.debug('===', 'injectDependencies()');
    $rootScope = _$rootScope_;
    $q = _$q_;
    SyncDriver = _SyncDriver_;
    SyncService = _SyncService_;
    WebSQLDriver = _WebSQLDriver_;
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
    IdentityService = _IdentityService_;
    PersistentStorage = new _PersistentStorage_(WebSQLDriver);

    var registered = false;

    runs(function () {
      PersistentStorage.register('JournalEntry', JournalEntry).then(function () {
        registered = true;
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return registered;
    });

    runs(function () {
      $log.debug('Dependencies injected');
    });
  }


  // Nuke local data
  function nukeLocalData() {
    $log.debug('===', 'nukeLocalData()');
    var nuked = false;

    runs(function () {
      JournalKeeper.nuke().then(function () {
        nuked = true;
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return nuked;
    }, 'JournalKeeper.nuke()', 1500);

    runs(function () {
      $log.debug('Local data nuked');
    });
  };


  function createSyncDriverConnection() {
    $log.debug('===', 'createSyncDriverConnection()');
    var signedIn = false;

    runs(function () {
      var promise = SyncDriver.login(FIREBASE_USERNAME, FIREBASE_PASSWORD);
      promise.then(function () {
        SyncDriver.registerSyncService(SyncService);
        signedIn = true;
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return signedIn;
    }, 'SyncDriver.login()', 2000);

    runs(function () {
      $log.debug('SyncDriver connection started');
    });
  }


  function createDirectConnection() {
    $log.debug('===', 'createDirectConnection()');
    var signedIn = false;

    runs(function () {
      createDirectFirebaseConnection().then(function () {
        signedIn = true;
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return signedIn;
    }, 'second connection', 2000);

    runs(function () {
      $log.debug('Direct connection created');
    });
  };


  function nukeRemoteData() {
    $log.debug('===', 'nukeRemoteData()');
    var nuked = false;

    runs(function () {
      journalRef.remove(function (err) {
        if (err) {
          $log.debug('Failed to clear data!', err);
        } else {
          nuked = true;
        }
      });
    });

    waitsFor(function () {
      return nuked;
    }, 'ref.remove()', 2000);

    runs(function () {
      $log.debug('Remote data nuked');
    });
  };


  function createEntries() {
    $log.debug('===', 'createEntries()');
    syncedEntry1 = new JournalEntry(1, new Date().getTime(), 'createFoo', 1, {name : 'foo'});
    syncedEntry2 = new JournalEntry(2, new Date().getTime(), 'createBar', 1, {name : 'bar'});
    syncedEntry3 = new JournalEntry(3, new Date().getTime(), 'createBaz', 1, {name : 'baz'});

    remoteEntry1 = new JournalEntry(1, new Date().getTime(), 'createRemoteFoo', 1, {name : 'foo'});
    remoteEntry2 = new JournalEntry(2, new Date().getTime(), 'createRemoteBar', 1, {name : 'bar'});
    remoteEntry3 = new JournalEntry(3, new Date().getTime(), 'createRemoteBaz', 1, {name : 'baz'});

    syncedEntries = [syncedEntry1, syncedEntry2, syncedEntry3];
    remoteEntries = [remoteEntry1, remoteEntry2, remoteEntry3];
    $log.debug('Entries created');
  }


  function persistLocallyForSync() {
    $log.debug('===', 'persistLocallyForSync()');
    var persisted = 0;
    var listed = false;

    runs(function () {
      for (var idx in syncedEntries) {
        PersistentStorage.persist(syncedEntries[idx]).then(function () {
          persisted++;
        });
      }
    });

    waitsFor(function () {
      $rootScope.$apply();
      return persisted === 3;
    }, 'PersistentStorage.persist');

    runs(function () {
      PersistentStorage.list('JournalEntry').then(function (result) {
        listed = result;
        console.log('@@@@@@@@@@', listed);
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      return listed;
    }, 'PersistentStorage.list()');

    runs(function () {
      expect(listed.length).toBe(3);
      $log.debug('Entries persisted locally');
    });
  }

  function listenForReceivedEntries() {
    $log.debug('===', 'listenForReceivedEntries()');

    $rootScope.$on('EntryReceived', function (e, entry) {
      $log.debug('Entry received', entry);
      receivedEntries.push(entry);
    });
  }

  function waitForSynchronization() {
    $log.debug('===', 'waitForSynchronization()');
    var remoteSent = false;

    runs(function () {
      sendEntriesToFirebase(remoteEntries).then(function () {
        $log.debug('Entries sent directly');
        remoteSent = true;
      }, function (err) {
        $log.debug('ERROR!', err);
      });
    });

    waitsFor(function () {
      $rootScope.$apply();
      var totalEntries = remoteEntries.length + syncedEntries.length;
      return remoteSent &&
        (receivedEntries.length === totalEntries);
    }, 'syncing and sending remotes');

    runs(function () {
      $log.debug('Sync and inserts done');
    });
  }


  function createDirectFirebaseConnection() {
    $log.debug('===', 'createDirectFirebaseConnection()');
    var deferred = $q.defer();

    new FirebaseSimpleLogin(journalRef, function(err, user) {
      if (err) {
        $log.debug('Firebase authentication error (login cb)', err);
        deferred.reject(err);
      } else if (user) {
        $log.debug('Direct Firebase conenction created');
        deferred.resolve(user);
      }
    }).login('password', {
      email : FIREBASE_USERNAME,
      password : FIREBASE_PASSWORD
    });

    return deferred.promise;
  }


  function sendEntriesToFirebase(entries) {
    $log.debug('===', 'sendEntriesToFirebase()');
    var promises = [];

    for (var idx in entries) {
      var entry = entries[idx];
      var deferred = $q.defer();

      console.log('%%%%%%%%%%%');

      journalRef.child(entry.sequence).transaction(function (currentValue) {
        if (currentValue === null) {
          entry.synced = new Date().getTime();

          return {
            '.value' : entry,
            '.priority' : entry.sequence
          };
        }
      }, function (err, committed, snapshot) {
        if (committed) {
          console.log('FLKDSJFLDSKJFLSKD');
          deferred.resolve(true);
        } else if (err) {
          deferred.reject(err);
        } else {
          deferred.reject('Duplicate entry sequence!');
        }
      });

      promises.push(deferred.promise);
    }

    var promise = $q.all(promises);

    promise.then(function () {
      $log.debug('>>>>>>>>>>> All entries sent to firebase');
    }, function (err) {
      console.log('FOOOOOO!', err);
    });

    return promise;
  }
});
