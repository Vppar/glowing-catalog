describe('WarmupService', function () {
  'use strict';

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  var $rootScope = null;
  var WarmupService = null;

  // Stores some dummy data to test stuff
  var timestamp = null;
  var data = null;
  var warmup = null;
  var warmupRef = null;


  beforeEach(function () {
      timestamp = 123456;
      data = ['foo', 'bar', 'baz'];

      warmup = {
          timestamp : timestamp,
          data : data
      };

      warmupRef = new FirebaseHelper.Firebase('warmup');
  });


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
  });


  // Clear localStorage. Make sure this is called before the service is
  // loaded.
  beforeEach(function () {
      delete localStorage.warmup;
  });


  // load the service's module
  beforeEach(function () {
    FirebaseHelper.reset();

    module('tnt.catalog.warmup.service');

    module(function ($provide) {
        $provide.value('$log', $log);
    });
  });


  // create spies
  beforeEach(function () {
  });


  beforeEach(inject(function(_$q_, _$rootScope_, _WarmupService_) {
      $rootScope = _$rootScope_;
      WarmupService = _WarmupService_;
      PromiseHelper.config(_$q_, $log.debug);
  }));


  it('is accessible', function () {
      expect(WarmupService).toBeDefined();
  });


  it('is an object', function () {
      expect(typeof WarmupService).toBe('object');
  });


  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.local', function () {
      it('is accessible', function () {
          expect(WarmupService.local).toBeDefined();
      });


      it('is an object', function () {
          expect(typeof WarmupService.local).toBe('object');
      });


      it('gets data stored in localStorage if any', function () {
          localStorage.setItem('warmup', JSON.stringify(warmup));

          // We need to reload the service to check if it updates the
          // .local attribute with the data stored in localStorage when it
          // is initialized.
          var $injector = angular.injector(['ng', 'tnt.catalog.warmup.service']);
          var WarmupService = $injector.get('WarmupService');
          expect(WarmupService.local).toEqual(warmup);
      });

      
      it('is an empty object if no data has been stored', function () {
          expect(localStorage.getItem('warmup')).toBe(null);
          expect(WarmupService.local).toEqual({});
      });
  });



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.getLocalData()', function () {
      it('is accessible', function () {
          expect(WarmupService.getLocalData).toBeDefined();
      });

      it('is a function', function () {
          expect(typeof WarmupService.getLocalData).toBe('function');
      });


      it('gets the data from localStorage', function () {
          localStorage.setItem('warmup', JSON.stringify(warmup));
          expect(WarmupService.getLocalData()).toEqual(warmup);
      });


      it('parses the data', function () {
          localStorage.setItem('warmup', JSON.stringify(warmup));
          expect(WarmupService.getLocalData()).toEqual(warmup);
          expect(typeof WarmupService.getLocalData()).not.toBe('string');
      });


      it('returns an empty object if no data is set', function () {
          expect(localStorage.getItem('warmup')).toBe(null);
          expect(WarmupService.getLocalData()).toEqual({});
      });
  }); // .getLocalData()



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.setLocalData()', function () {
      it('is accessible', function () {
          expect(WarmupService.setLocalData).toBeDefined();
      });

      it('is a function', function () {
          expect(typeof WarmupService.setLocalData).toBe('function');
      });


      it('stores a warmup object in localStorage', function () {
          expect(localStorage.getItem('warmup')).toBe(null);
          WarmupService.setLocalData(warmup.timestamp, warmup.data);

          expect(localStorage.getItem('warmup')).not.toBe(null);
          expect(WarmupService.getLocalData()).toEqual(warmup);
      });

      it('stringifies data before storing', function () {
          WarmupService.setLocalData(warmup.timestamp, warmup.data);
          expect(localStorage.getItem('warmup')).toBe(JSON.stringify(warmup));
      });

      it('updates the .local attribute', function () {
          expect(WarmupService.local).toEqual({});
          WarmupService.setLocalData(warmup.timestamp, warmup.data);
          expect(WarmupService.local).toEqual(warmup);
      });
  }); // .setLocalData()



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.updateLocalData()', function () {
      it('is accessible', function () {
          expect(WarmupService.updateLocalData).toBeDefined();
      });

      it('is a function', function () {
          expect(typeof WarmupService.updateLocalData).toBe('function');
      });


      it('returns a promise', function () {
          var promise = WarmupService.updateLocalData(warmupRef, 123);
          expect(promise.then).toBeDefined();
          expect(typeof promise.then).toBe('function');
      });


      it('gets data for the given timestamp from remote storage', function () {
          var timestamp = 123456;

          WarmupService.updateLocalData(warmupRef, timestamp);
          
          // Make sure data is gotten from the '.data' container
          expect(warmupRef.child).toHaveBeenCalledWith('data');

          var dataRef = FirebaseHelper.getRef('warmup.data');
          expect(dataRef.child).toHaveBeenCalledWith(timestamp);

          var timestampRef = FirebaseHelper.getRef('warmup.data.' + timestamp);
          var args = timestampRef.once.calls[0].args;
          expect(args[0]).toBe('value');
      });


      describe('when data is found' , function () {
          it('sets local data', function () {
              WarmupService.updateLocalData(warmupRef, warmup.timestamp);

              var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
              spyOn(WarmupService, 'setLocalData');
              FirebaseHelper.trigger(timestampRef, 'value', warmup.data);
              expect(WarmupService.setLocalData).toHaveBeenCalledWith(warmup.timestamp, warmup.data);
          });

          it('resolves the promise', function () {
              var resolved = false;

              runs(function () {
                  WarmupService.updateLocalData(warmupRef, warmup.timestamp)
                      .then(function () {
                          resolved = true;
                      });
              });

              runs(function () {
                  var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
                  FirebaseHelper.trigger(timestampRef, 'value', warmup.data);
              });

              waitsFor(function () {
                  $rootScope.$apply();
                  return resolved;
              });
          });


          it('passes the timestamp to the promise resolution', function () {
              var resolved = false;

              runs(function () {
                  WarmupService.updateLocalData(warmupRef, warmup.timestamp)
                      .then(function (timestamp) {
                          expect(timestamp).toBe(warmup.timestamp);
                          resolved = true;
                      });
              });

              runs(function () {
                  var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
                  FirebaseHelper.trigger(timestampRef, 'value', warmup.data);
              });

              waitsFor(function () {
                  $rootScope.$apply();
                  return resolved;
              });
          });

          it('broadcasts the LocalWarmupDataUpdated event', function () {
              var resolved = false;

              runs(function () {
                  WarmupService.updateLocalData(warmupRef, warmup.timestamp);

                  $rootScope.$on('LocalWarmupDataUpdated', function () {
                      resolved = true;
                  });
              });

              runs(function () {
                  var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
                  FirebaseHelper.trigger(timestampRef, 'value', warmup.data);
              });

              waitsFor(function () {
                  $rootScope.$apply();
                  return resolved;
              });
          });
      }); // when data is found


      describe('when data is not found', function () {
          it('logs a fatal', function () {
              var rejected = false;

              runs(function () {
                  WarmupService.updateLocalData(warmupRef, warmup.timestamp)
                      .then(null, function () {
                          rejected = true;
                      });

              });

              runs(function () {
                  var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
                  FirebaseHelper.trigger(timestampRef, 'value', null);
              });

              waitsFor(function () {
                  $rootScope.$apply();
                  return rejected;
              });
          });

          // If there's no remote data stored for the given timestamp, the
          // promise should be rejected.
          it('rejects the returned promise if no data is found', function () {
              var rejected = false;

              runs(function () {
                  WarmupService.updateLocalData(warmupRef, warmup.timestamp)
                      .then(null, function (err) {
                          expect(err).toBe('Warmup data not found');
                          rejected = true;
                      });

              });

              runs(function () {
                  var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
                  FirebaseHelper.trigger(timestampRef, 'value', null);
              });

              waitsFor(function () {
                  $rootScope.$apply();
                  return rejected;
              });
          });
      }); // when data is not found
  }); // .updateLocalData();



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.setRemoteData()', function () {

      it('is accessible', function () {
          expect(WarmupService.setRemoteData).toBeDefined();
      });

      it('is a function', function () {
          expect(typeof WarmupService.setRemoteData).toBe('function');
      });


      it('returns a promise', function () {
          var result = WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data);
          expect(result.then).toBeDefined();
          expect(typeof result.then).toBe('function');
      });


      it('sets remote data for the given timestamp', function () {
          WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data);
          
          // Make sure data is set in the '.data' container
          expect(warmupRef.child).toHaveBeenCalledWith('data');

          var dataRef = FirebaseHelper.getRef('warmup.data');
          expect(dataRef.child).toHaveBeenCalledWith(warmup.timestamp);

          var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
          expect(timestampRef.transaction).toHaveBeenCalled();
      });


      it('does not set remote data if data for the given timestamp already exists',
        function () {
            WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data);

            var someData = 'foobar';
            var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
            FirebaseHelper.runTransaction(timestampRef, someData);

            expect(timestampRef.transaction.committed).toBe(false);
        });


      it('rejects the promise if unable to store the data', function () {
          var rejected = false;

          runs(function () {
              WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data)
                  .then(null, function (err) {
                      expect(err).toBe('An error!');
                      rejected = true;
                  });

              var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
              FirebaseHelper.runTransaction(timestampRef, 'foo', 'An error!');

              expect(timestampRef.transaction.committed).toBe(false);
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });

      it('rejects the promise if data already exists', function () {
          var existingData = 'foobar';
          var rejected = false;

          runs(function () {
              WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data)
                  .then(null, function (err) {
                      expect(err).toBe('Data already exists for the given timestamp');
                      rejected = true;
                  });

              var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
              FirebaseHelper.runTransaction(timestampRef, existingData);

              expect(timestampRef.transaction.committed).toBe(false);
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });

      it('resolves the promise when data is stored', function () {
          var resolved = false;

          runs(function () {
              WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data)
                  .then(function (timestamp) {
                      resolved = true;
                  });

              var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
              FirebaseHelper.runTransaction(timestampRef, null);
              expect(timestampRef.transaction.committed).toBe(true);
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });
      });

      it('passes a timestamp when promise is resolved', function () {
          var resolved = false;

          runs(function () {
              WarmupService.setRemoteData(warmupRef, warmup.timestamp, warmup.data)
                  .then(function (timestamp) {
                      expect(timestamp).toBe(warmup.timestamp);
                      resolved = true;
                  });

              var timestampRef = FirebaseHelper.getRef('warmup.data.' + warmup.timestamp);
              FirebaseHelper.runTransaction(timestampRef, null);
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });
      });
  }); // .setRemoteData()



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.setRemoteTimestamp()', function () {
      it('is accessible', function () {
          expect(WarmupService.setRemoteTimestamp).toBeDefined();
      });

      it('is a function', function () {
          expect(typeof WarmupService.setRemoteTimestamp).toBe('function');
      });


      it('returns a promise', function () {
          var result = WarmupService.setRemoteTimestamp(warmupRef, timestamp);
          expect(result.then).toBeDefined();
          expect(typeof result.then).toBe('function');
      });


      it('sets the timestamp attribute in the given reference', function () {
          WarmupService.setRemoteTimestamp(warmupRef, timestamp);
          
          // Make sure data is set in the '.timestamp' container
          expect(warmupRef.child).toHaveBeenCalledWith('timestamp');

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          expect(timestampRef.transaction).toHaveBeenCalled();
      });

      it('sets the timestamp if it is newer than the one already stored',
        function () {
            WarmupService.setRemoteTimestamp(warmupRef, timestamp);

            // An older timestamp
            var remoteTimestamp = timestamp - 1;
            var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
            FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            expect(timestampRef.transaction.committed).toBe(true);
        });


      it('resolves the promise if the timestamp is newer than the one already stored',
        function () {
            var resolved = false;
            // Stored timestamp is older than the given one...
            var remoteTimestamp = timestamp - 1;

            runs(function () {
                WarmupService.setRemoteTimestamp(warmupRef, timestamp)
                    .then(function () {
                        resolved = true;
                    });

                var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
                FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            });

            waitsFor(function () {
                $rootScope.$apply();
                return resolved;
            });
        });

      it('sets the timestamp if there\'s no timestamp set', function () {
          WarmupService.setRemoteTimestamp(warmupRef, timestamp);

          var remoteTimestamp = null;
          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
          expect(timestampRef.transaction.committed).toBe(true);
      });

      it('resolves the promise if there\'s no timestamp set', function () {
          var resolved = false;
          // No timestamp stored...
          var remoteTimestamp = null;

          runs(function () {
              WarmupService.setRemoteTimestamp(warmupRef, timestamp)
                  .then(function () {
                      resolved = true;
                  });

              var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
              FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });
      });

      it('does not set the timestamp if it is older than the one stored',
        function () {
            WarmupService.setRemoteTimestamp(warmupRef, timestamp);

            // Remote timestamp is newer than the given one
            var remoteTimestamp = timestamp + 1;
            var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
            FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            expect(timestampRef.transaction.committed).toBe(false);
        });

      it('rejects the promise if the timestamp is older than the one stored',
        function () {
            var rejected = false;
            // Given timestamp is older than the one stored...
            var remoteTimestamp = timestamp + 1;

            runs(function () {
                WarmupService.setRemoteTimestamp(warmupRef, timestamp)
                    .then(null, function (err) {
                        expect(err).toBe('Remote timestamp is newer');
                        rejected = true;
                    });

                var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
                FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });
        });


      it('does not set the timestamp if it is equal the one stored',
        function () {
            WarmupService.setRemoteTimestamp(warmupRef, timestamp);

            // Remote timestamp is newer than the given one
            var remoteTimestamp = timestamp;
            var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
            FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            expect(timestampRef.transaction.committed).toBe(false);
        });


      it('resolves the promise if the timestamp is equal the one stored',
        function () {
            var resolved = false;
            // Given timestamp is equal the one stored...
            var remoteTimestamp = timestamp;

            runs(function () {
                WarmupService.setRemoteTimestamp(warmupRef, timestamp)
                    .then(function (timestamp) {
                        expect(timestamp).toBe(remoteTimestamp);
                        resolved = true;
                    });

                var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
                FirebaseHelper.runTransaction(timestampRef, remoteTimestamp);
            });

            waitsFor(function () {
                $rootScope.$apply();
                return resolved;
            });
        });

      it('rejects the promise if unable to store the timestamp',
        function () {
            var rejected = false;
            var remoteTimestamp = timestamp - 1;

            runs(function () {
                WarmupService.setRemoteTimestamp(warmupRef, timestamp)
                    .then(null, function (err) {
                        expect(err).toBe('An error!');
                        rejected = true;
                    });

                var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
                FirebaseHelper.runTransaction(timestampRef, remoteTimestamp, 'An error!');
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });
        });
  }); // .setRemoteTimestamp()



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.updateRemoteData()', function () {
      beforeEach(function () {
          spyOn(WarmupService, 'setRemoteData').andCallFake(PromiseHelper.resolved(timestamp));
          spyOn(WarmupService, 'setRemoteTimestamp').andCallFake(PromiseHelper.resolved(timestamp));
      });


      it('is accessible', function () {
          expect(WarmupService.updateRemoteData).toBeDefined()
      });

      it('is a function', function () {
          expect(typeof WarmupService.updateRemoteData).toBe('function');
      });

      it('returns a promise', function () {
          var result = WarmupService.updateRemoteData(warmupRef, timestamp, data);
          expect(result.then).toBeDefined();
          expect(typeof result.then).toBe('function');
      });

      it('rejects the promise if no reference is given', function () {
          var rejected = false;

          runs(function () {
              WarmupService.updateRemoteData(null, timestamp, data)
                  .then(null, function (err) {
                      expect(err).toBe('Missing reference to remote location');
                      rejected = true;
                  });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });

      it('rejects the promise if no timestamp is given', function () {
          var rejected = false;

          runs(function () {
              WarmupService.updateRemoteData(warmupRef, null, data)
                  .then(null, function (err) {
                      expect(err).toBe('Missing timestamp');
                      rejected = true;
                  });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });

      it('sets the remote data for the given timestamp', function () {
          var resolved = false;

          runs(function () {
              WarmupService.updateRemoteData(warmupRef, timestamp, data)
                  .then(function () {
                      resolved = true;
                  });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });

          runs(function () {
              expect(WarmupService.setRemoteData).toHaveBeenCalledWith(warmupRef, timestamp, data);
          });
      });

      it('sets the remote timestamp once the data is set for it', function () {
          WarmupService.setRemoteData.andCallFake(function () {
              // Make sure that setRemoteData is called before
              expect(WarmupService.setRemoteTimestamp).not.toHaveBeenCalled();
              return PromiseHelper.resolved()();
          });

          var resolved = false;

          runs(function () {
              WarmupService.updateRemoteData(warmupRef, timestamp, data)
                  .then(function () {
                      resolved = true;
                  });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });

          runs(function () {
              expect(WarmupService.setRemoteData).toHaveBeenCalledWith(warmupRef, timestamp, data);
              expect(WarmupService.setRemoteTimestamp).toHaveBeenCalledWith(warmupRef, timestamp);
          });
      });

      it('does not set the remote timestamp if it fails to store the data',
        function () {
            WarmupService.setRemoteData.andCallFake(PromiseHelper.rejected('An error!'));

            var rejected = false;

            runs(function () {
                WarmupService.updateRemoteData(warmupRef, timestamp, data)
                    .then(null, function (err) {
                        expect(err).toBe('An error!');
                        rejected = true;
                    });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });

            runs(function () {
                expect(WarmupService.setRemoteData).toHaveBeenCalledWith(warmupRef, timestamp, data);
                expect(WarmupService.setRemoteTimestamp).not.toHaveBeenCalled();
            });
        });

      it('broadcasts the RemoteWarmupDataUpdated event when the remote timestamp is set',
        function () {
            var resolved = false;

            $rootScope.$on('RemoteWarmupDataUpdated', function (e, arg1, arg2) {
                expect(arg1).toBe(timestamp);
                expect(arg2).toEqual(data);
                resolved = true;
            });

            runs(function () {
                WarmupService.updateRemoteData(warmupRef, timestamp, data);
            });

            waitsFor(function () {
                $rootScope.$apply();
                return resolved;
            });
        });


      it('does not broadcasts the event if failed to set remote timestamp',
        function () {
            WarmupService.setRemoteTimestamp
                .andCallFake(PromiseHelper.rejected('An error!'));

            var rejected = false;

            var listener = jasmine.createSpy('eventListener');
            $rootScope.$on('RemoteWarmupDataUpdated', listener);

            runs(function () {
                WarmupService.updateRemoteData(warmupRef, timestamp, data)
                    .then(null, function (err) {
                        expect(err).toBe('An error!');
                        rejected = true;
                    });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });

            runs(function () {
                expect(listener).not.toHaveBeenCalled();
            });
        });


      it('does not broadcasts the event if failed to set remote data',
        function () {
            WarmupService.setRemoteData
                .andCallFake(PromiseHelper.rejected('An error!'));

            var rejected = false;

            var listener = jasmine.createSpy('eventListener');
            $rootScope.$on('RemoteWarmupDataUpdated', listener);

            runs(function () {
                WarmupService.updateRemoteData(warmupRef, timestamp, data)
                    .then(null, function (err) {
                        expect(err).toBe('An error!');
                        rejected = true;
                    });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });

            runs(function () {
                expect(listener).not.toHaveBeenCalled();
            });
        });

  }); // .updateRemoteData()



  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  describe('.watchRemoteData()', function () {
      beforeEach(function () {
          spyOn(WarmupService, 'updateLocalData');
          spyOn(WarmupService, 'setRemoteData');
      });

      it('is accessible', function () {
          expect(WarmupService.watchRemoteData).toBeDefined()
      });

      it('is a function', function () {
          expect(typeof WarmupService.watchRemoteData).toBe('function');
      });

      it('does nothing if no reference is given', function () {
          WarmupService.watchRemoteData(null);
          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');

          expect(timestampRef).toBeUndefined();
          expect(WarmupService.updateLocalData).not.toHaveBeenCalled();
          expect(WarmupService.setRemoteData).not.toHaveBeenCalled();
      });

      it('logs an error if no reference is given', function () {
          WarmupService.watchRemoteData(null);
          expect($log.error).toHaveBeenCalled();
      });

      it('listens to change on the remote timestamp', function () {
          WarmupService.watchRemoteData(warmupRef);
          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          var args = timestampRef.on.calls[0].args;
          expect(args[0]).toBe('value');
      });

      it('updates local data when local data is not set', function () {
          var remoteTimestamp = timestamp;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.updateLocalData).toHaveBeenCalledWith(warmupRef, remoteTimestamp);
      });

      it('updates local data when remote timestamp is newer', function () {
          WarmupService.setLocalData(timestamp, data);

          var remoteTimestamp = timestamp + 1;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.updateLocalData).toHaveBeenCalledWith(warmupRef, remoteTimestamp);
      });

      it('updates remote data when remote data is not set', function () {
          WarmupService.setLocalData(timestamp, data);

          var remoteTimestamp = null;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.setRemoteData).toHaveBeenCalledWith(warmupRef, timestamp, data);
      });

      it('updates remote data when local timestamp is newer', function () {
          WarmupService.setLocalData(timestamp, data);

          // Remote data is outdated...
          var remoteTimestamp = timestamp - 1;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.setRemoteData).toHaveBeenCalledWith(warmupRef, timestamp, data);
      });

      it('does nothing if nor local nor remote data are set', function () {
          // Remote data is not set
          var remoteTimestamp = null;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.setRemoteData).not.toHaveBeenCalled();
          expect(WarmupService.updateLocalData).not.toHaveBeenCalled();
      });


      it('does nothing if local and remote timestamps are the same', function () {
          WarmupService.setLocalData(timestamp, data);

          // Remote data is not set
          var remoteTimestamp = timestamp;

          WarmupService.watchRemoteData(warmupRef);

          var timestampRef = FirebaseHelper.getRef('warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', remoteTimestamp);

          expect(WarmupService.setRemoteData).not.toHaveBeenCalled();
          expect(WarmupService.updateLocalData).not.toHaveBeenCalled();
      });
  }); // .watchRemoteData()

});
