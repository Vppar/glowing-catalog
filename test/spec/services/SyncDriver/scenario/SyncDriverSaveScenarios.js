describe('Service: SyncDriverSaveScenarios', function () {
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

    module(function ($provide) {
      $provide.value('$log', $log);
    });
  });


  beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    SyncDriver = _SyncDriver_;
  }));


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
    }, 'SyncDriver.login()');
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
    }, 'ref.remove()');
  });



  describe('happy day scenario', function () {
    var entry = {
      sequence : 123,
      bar : 'baz'
    };

    it('stores data in Firebase', function () {
      var saved = false;
      var retrieved = false;

      runs(function () {
        var promise = SyncDriver.save(entry);
        promise.then(function () {
          saved = true;
        });
      });

      runs(function () {
        journalTestRef.child(entry.sequence).once('value', function (snapshot) {
          retrieved = true;
          // Test that the data has been updated
          expect(snapshot.val()).toEqual(entry);
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return saved && retrieved;
      }, 'SyncDriver.save()');
    });
  }); // happy day scenario


  // Try to save the same entry twice
  describe('failure scenario for duplicate entry', function () {
    var entry = {
      sequence : 567,
      woo : 'hoo'
    };

    // Save initial data
    beforeEach(function () {
      var saved = false;

      runs(function () {
        var promise = SyncDriver.save(entry);
        promise.then(function () {
          saved = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return saved;
      }, 'SyncDriver.save()');
    });


    it('fails when trying to save the entry twice', function () {
      var failed = false;

      runs(function () {
        var promise = SyncDriver.save(entry);
        promise.then(null, function (err) {
          expect(err).toBe('Entry 567 already saved!');
          failed = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return failed;
      }, 'second SyncDriver.save()');
    });
  }); // failure scenario
});
