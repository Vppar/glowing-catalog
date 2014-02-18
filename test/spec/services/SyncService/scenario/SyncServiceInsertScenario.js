describe('Service: SyncServiceInsertScenario', function () {
  'use strict';

  var FIREBASE_USER_DATA_LOCATION = 'voppwishlist.firebaseio.com/users/test@fake_acc';
  var FIREBASE_USERNAME = 'test@fake.acc';
  var FIREBASE_PASSWORD = 'senha123';

  var logger = angular.noop;
  //var logger = console.log;

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


  var baseTestRef = new Firebase(FIREBASE_USER_DATA_LOCATION);
  var journalTestRef = null;


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
  });

  // load the service's module
  beforeEach(function () {
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
  });


  beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_, _SyncService_, _WebSQLDriver_, _JournalKeeper_, _JournalEntry_, _PersistentStorage_, _IdentityService_) {
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
  }));


  // Create spies
  beforeEach(function () {
    spyOn(SyncDriver, 'save').andCallThrough();
    spyOn(SyncService, 'sync').andCallThrough();
    spyOn(SyncService, 'insert').andCallThrough();
  });


  // Nuke local data
  beforeEach(function () {
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
  });


  // Sign in to Firebase
  beforeEach(function () {
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
  });

  // Get a reference to the journal
  beforeEach(function () {
    journalTestRef = baseTestRef.child('journal');
  });

  // Clear journal
  beforeEach(function () {
    var cleared = false;

    runs(function () {
      journalTestRef.remove(function (err) {
        if (err) {
          $log.debug('Failed to clear data!', err);
        } else {
          $log.debug('Data cleared!');
          cleared = true;
        }
      });
    });

    waitsFor(function () {
      return cleared;
    }, 'ref.remove()', 2000);
  });


  describe('happy day', function () {
    var entry1, entry2, entry3, entries, received, listed;

    beforeEach(function () {
      entry1 = new JournalEntry(1, new Date().getTime(), 'createFoo', 1, {name : 'foo'});
      entry2 = new JournalEntry(2, new Date().getTime() + 100, 'createBar', 1, {name : 'bar'});
      entry3 = new JournalEntry(3, new Date().getTime() + 300, 'createBaz', 1, {name : 'baz'});

      entries = [entry1, entry2, entry3];

      var persisted1 = false;
      var persisted2 = false;
      var persisted3 = false;

      runs(function () {
        PersistentStorage.persist(entry1).then(function () {
          persisted1 = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return persisted1;
      }, 'first PeristentStorage.persist()');

      runs(function () {
        PersistentStorage.persist(entry2).then(function () {
          persisted2 = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return persisted2;
      }, 'second PeristentStorage.persist()');

      runs(function () {
        PersistentStorage.persist(entry3).then(function () {
          persisted3 = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return persisted3;
      }, 'third PeristentStorage.persist()');

      runs(function () {
        PersistentStorage.list('JournalEntry').then(function (result) {
          listed = result;
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

    });



    beforeEach(function () {
      var synced = false;
      received = [];

      $rootScope.$on('Firebase:childAdded', function (e, entry) {
        received.push(entry);
      });

      runs(function () {
        SyncService.sync().then(function () {
          synced = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return synced && received.length === 3;
      }, 'SyncService.sync() && Firebase return', 8000);

      runs(function () {
        $log.debug('Sync complete and entries returned!');
      });
    });


    it('stores only the expeted entries in Firebase', function () {
      expect(received.length).toBe(entries.length);

      for (var idx in entries) {
        expect(received[idx].sequence).toBe(entries[idx].sequence);
        expect(received[idx].stamp).toBe(entries[idx].stamp, 'stamps do not match');
        expect(received[idx].uuid).toBe(entries[idx].uuid, 'uuids do not match');
        expect(received[idx].synced).not.toBe(0);
      }
    });
  }); // happy day

});
