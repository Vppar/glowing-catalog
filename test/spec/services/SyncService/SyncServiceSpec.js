describe('Service: SyncService', function () {

  var showLog = false;

  var logger = showLog ? console.log : angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  var $rootScope = null;
  var $q = null;

  var SyncService = null;
  var JournalEntry = null;

  var SyncDriverMock = {};
  var JournalKeeperMock = {};

  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();

      SyncDriverMock.save = jasmine.createSpy('SyncDriver.save');

      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced');
      JournalKeeperMock.markAsSynced = jasmine.createSpy('JournalKeeper.markAsSynced');
  });


  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.sync.service');
    module('tnt.catalog.journal.entity');

    module(function ($provide) {
      $provide.value('$log', $log);
      $provide.value('SyncDriver', SyncDriverMock);
      $provide.value('JournalKeeper', JournalKeeperMock);
    });
  });


  beforeEach(inject(function(_$rootScope_, _$q_, _SyncService_, _JournalEntry_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    SyncService = _SyncService_;
    JournalEntry = _JournalEntry_;

  }));



  it('is accessible', function () {
    expect(SyncService).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncService).toBe('object');
  });



  describe('SyncService.getStashedEntries()', function () {
    var originalStash = ['foo', 'bar'];

    it('is accessible', function () {
      expect(SyncService.getStashedEntries).toBeDefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.getStashedEntries).toBe('function');
    });

    it('returns an emtpy array if there\'s no stash', function () {
      // By default, stash is null when the module is loaded.
      expect(SyncService.getStashedEntries()).toEqual([]);
    });

    it('returns a shallow copy of the stash', function () {
      JournalKeeperMock.readUnsynced = jasmine.createSpy('JournalKeeper.readUnsynced')
        .andCallFake(resolvedPromiseReturner(originalStash));

      JournalKeeperMock.remove = jasmine.createSpy('JournalKeeper.remove')
        .andCallFake(resolvedPromiseReturner(true));
      
      var stashed = false;

      runs(function () {
        var promise = SyncService.stashEntries();
        promise.then(function () {
          stashed = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return stashed;
      }, 'SyncService.stashEntries()', 200);

      runs(function () {
        var stash1 = SyncService.getStashedEntries();
        var stash2 = SyncService.getStashedEntries();

        // The returned value MUST not be the same array returned
        // by readUnsynced()
        expect(stash1).not.toBe(originalStash);
        expect(stash1).toEqual(originalStash);

        // Running getStashedEntries() multiple times, should always
        // return a new array (prevent others from getting access to the
        // original stash array).
        expect(stash1).not.toBe(stash2);
        expect(stash1).toEqual(stash2);
      });
    });
  });



  describe('SyncService.sync()', function () {
    var entry1 = {};
    var entry2 = {};
    var entries = {};

    beforeEach(function () {
      // Create some fake entries
      entry1 = new JournalEntry(null, 12345, 'entityCreate', 1, {});
      entry2 = new JournalEntry(null, 67890, 'entityCreate', 1, {});
      entries = [entry1, entry2];
    });

    it('is accessible', function () {
      expect(SyncService.sync).not.toBeUndefined();
    });

    it('is a function', function () {
      expect(typeof SyncService.sync).toBe('function');
    });

    it('gets unsynced entries from journal keeper', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(true));
      expect(JournalKeeperMock.readUnsynced).not.toHaveBeenCalled();
      SyncService.sync();
      expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
    });

    it('sends unsynced entries to synchronization driver', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.save.andCallFake(resolvedPromiseReturner(true));

      var synced = false;

      runs(function () {
        var promise = SyncService.sync();
        promise.then(function () {
          synced = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return synced;
      });

      runs(function () {
        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.save).toHaveBeenCalledWith(entries);
      });
    });

    it('sends entries-to-be-synced back to journal keeper', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.save.andCallFake(resolvedPromiseReturner(entries));
      JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

      var synced = false;

      runs(function () {
        var promise = SyncService.sync();
        promise.then(function () {
          synced = true;
        });
      });

      waitsFor(function () {
        $rootScope.$apply();
        return synced;
      }, 'SyncService.sync()', 100);

      runs(function () {
        expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
        expect(SyncDriverMock.save).toHaveBeenCalledWith(entries);
        for (var idx in entries) {
          expect(JournalKeeperMock.markAsSynced.calls[idx].args[0]).toBe(entries[idx]);
        }
        expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
      });
    });

    it('returns a promise', function () {
      JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
      SyncDriverMock.save.andCallFake(resolvedPromiseReturner(entries));
      JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

      var promise = SyncService.sync();

      // Check if we return a promise
      expect(typeof promise.then).toBe('function');
      expect(typeof promise['catch']).toBe('function');
      expect(typeof promise['finally']).toBe('function');
    });


    describe('returned promise', function () {
      it('is rejected if failed to get unsynced entries from journal', function () {
        // JournalKeeper.readUnsynced() rejects
        // SyncDriver.sync() is not called
        // JournalKeeper.markAsSynced() is not called
        JournalKeeperMock.readUnsynced.andCallFake(rejectedPromiseReturner('Rejecting JournalKeeper.readUnsynced()'));

        var rejected = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(null, function (err) {
            expect(err).toBe('Rejecting JournalKeeper.readUnsynced()');
            rejected = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return rejected;
        }, 'SyncService.sync()', 100);

        runs(function () {
          expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
          expect(rejected).toBe(true);
          expect(SyncDriverMock.save).not.toHaveBeenCalled();
          expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();
        });
      });

      it('is rejected when sync driver fails to sync entries', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() rejects
        // JournalKeeper.markAsSynced() is not called
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.save.andCallFake(rejectedPromiseReturner('Rejecting SyncDriver.sync()'));

        var resolved = false;
        var rejected = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(function () {
            resolved = true;
          }, function (err) {
            expect(err).toBe('Rejecting SyncDriver.sync()');
            rejected = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved || rejected;
        }, 'SyncService.sync()', 100);

        runs(function () {
          expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
          expect(SyncDriverMock.save).toHaveBeenCalledWith(entries);
          expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();

          expect(resolved).toBe(false);
          expect(rejected).toBe(true);
        });
      });

      it('is rejected if journal keeper fails to mark any of the entries as synced', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() resolves
        // One or more JournalKeeper.markAsSynced() rejects
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.save.andCallFake(resolvedPromiseReturner(entries));
        JournalKeeperMock.markAsSynced.andCallFake(rejectedPromiseReturner('Rejecting JournalKeeper.markAsSynced()'));

        var resolved = false;
        var rejected = false;

        runs(function () {
          var promise = SyncService.sync();
          promise.then(function () {
            resolved = true;
          }, function (err) {
            expect(err).toBe('Rejecting JournalKeeper.markAsSynced()');
            rejected = true;
          });
        });


        waitsFor(function () {
          $rootScope.$apply();
          return resolved || rejected;
        }, 'SyncService.sync()', 100);

        runs(function () {
          expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
          expect(SyncDriverMock.save).toHaveBeenCalledWith(entries);
          expect(JournalKeeperMock.markAsSynced).toHaveBeenCalled();
          for (var idx in  entries) {
            expect(JournalKeeperMock.markAsSynced.calls[idx].args[0]).toBe(entries[idx]);
          }
          expect(resolved).toBe(false);
          expect(rejected).toBe(true);
        });
      });


      it('is resolved if everything goes well', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() resolves
        // All JournalKeeper.markAsSynced() resolve
        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner(entries));
        SyncDriverMock.save.andCallFake(resolvedPromiseReturner(entries));
        JournalKeeperMock.markAsSynced.andCallFake(resolvedPromiseReturner(true));

        var rejected = false;
        var resolved = false;

        runs(function () {
          var promise = SyncService.sync();

          promise.then(function (result) {
            expect(result.length).toBe(2);
            for (var idx in result) {
              expect(result[idx]).toBe(true);
            }
            resolved = true;
          }, function (err) {
            rejected = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved || rejected;
        }, 'SyncService.sync()', 100);

        runs(function () {
          expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
          expect(SyncDriverMock.save).toHaveBeenCalledWith(entries);
          expect(JournalKeeperMock.markAsSynced.callCount).toBe(2);
          expect(resolved).toBe(true);
          expect(rejected).toBe(false);
        });
      });

      it('is resolved if there are no unsynced entries', function () {
        // JournalKeeper.readUnsynced() resolves
        // SyncDriver.sync() is not called
        // JournalKeeper.markAsSynced() is not called

        JournalKeeperMock.readUnsynced.andCallFake(resolvedPromiseReturner([]));

        var resolved = false;
        var rejected = false;

        runs(function () {
          var promise = SyncService.sync();

          promise.then(function () {
            resolved = true;
          }, function (err) {
            rejected = true;
          });
        });

        waitsFor(function () {
          $rootScope.$apply();
          return resolved || rejected;
        }, 'SyncService.sync()', 100);

        runs(function () {
          expect(JournalKeeperMock.readUnsynced).toHaveBeenCalled();
          expect(SyncDriverMock.save).not.toHaveBeenCalled();
          expect(JournalKeeperMock.markAsSynced).not.toHaveBeenCalled();

          expect(resolved).toBe(true);
          expect(rejected).toBe(false);
        });
      });
    });
  }); // SyncService.sync()



  function resolvedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();

      setTimeout(function () {
        $log.debug('Promise resolved with result', result);
        deferred.resolve(result);
      }, 0);

      return deferred.promise;
    };
  }

  function rejectedPromiseReturner(result) {
    return function () {
      var deferred = $q.defer();

      setTimeout(function () {
        $log.debug('Promise rejected with result', result);
        deferred.reject(result);
      }, 0);

      return deferred.promise;
    };
  }
});
