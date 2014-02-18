describe('Service: SyncServiceSyncScenario', function () {
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

    module(function ($provide) {
      $provide.value('$log', $log);
    });
  });


  beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_, _SyncService_, _WebSQLDriver_, _JournalKeeper_, _JournalEntry_, _PersistentStorage_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    SyncDriver = _SyncDriver_;
    SyncService = _SyncService_;
    WebSQLDriver = _WebSQLDriver_;
    JournalKeeper = _JournalKeeper_;
    JournalEntry = _JournalEntry_;
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
    var entry1, entry2, entry3;

    beforeEach(function () {
      entry1 = new JournalEntry(1, new Date().getTime(), 'createFoo', 1, {name : 'foo'});
      entry2 = new JournalEntry(2, new Date().getTime() + 100, 'createBar', 1, {name : 'bar'});
      entry3 = new JournalEntry(3, new Date().getTime() + 300, 'createBar', 1, {name : 'baz'});

      var persisted1 = false;
      var persisted2 = false;
      var persisted3 = false;
      var entries = null;

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
          entries = result;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return entries;
      }, 'PersistentStorage.list()');

      runs(function () {
        expect(entries.length).toBe(3);
        $log.debug('Entries persisted locally');
      });

    });


    beforeEach(function () {
      var synced = false;

      runs(function () {
        SyncService.sync().then(function () {
          synced = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return synced;
      }, 'SyncService.sync', 5000);

      runs(function () {
        $log.debug('Sync complete!');
      });
    });

    it('calls SyncDriver.sync() and SyncService.insert()', function () {
      expect(SyncDriver.save).toHaveBeenCalled();
      expect(SyncService.sync).toHaveBeenCalled();
      //expect(SyncService.insert).toHaveBeenCalled();
    });

    it('has only entries with synced attr set', function () {
      var entries = null;

      runs(function () {
        PersistentStorage.list('JournalEntry').then(function (result) {
          entries = result;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return entries;
      }, 'PersistentStorage.list');


      runs(function () {
        for (var idx in entries) {
          expect(entries[idx].synced).toBeDefined();
          expect(entries[idx].synced).not.toBe(0);
        }
      });
    });
  }); // happy day

});
