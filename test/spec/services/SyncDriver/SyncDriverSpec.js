describe('Service: SyncDriver', function () {
  'use strict';

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  var $rootScope = null;
  var SyncDriver = null;

  var FirebaseMock = null;
  var FirebaseSimpleLoginMock = null;

  var CatalogConfigMock = null;


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
  });


  // load the service's module
  beforeEach(function () {
    FirebaseHelper.reset();

    FirebaseMock = FirebaseHelper.Firebase;
    FirebaseSimpleLoginMock = FirebaseHelper.FirebaseSimpleLogin;

    CatalogConfigMock = {
        firebaseURL : 'firebase'
    };

    module('tnt.catalog.sync.driver');

    module(function ($provide) {
      $provide.value('$log', $log);
      $provide.value('Firebase', FirebaseMock);
      $provide.value('FirebaseSimpleLogin', FirebaseSimpleLoginMock);
      $provide.value('CatalogConfig', CatalogConfigMock);
    });
  });

  // create spies
  beforeEach(function () {
      spyOn(FirebaseSimpleLoginMock.prototype, 'changePassword');
      spyOn(FirebaseSimpleLoginMock.prototype, 'login');
  });

  beforeEach(inject(function(_$rootScope_, _SyncDriver_) {
    $rootScope = _$rootScope_;
    SyncDriver = _SyncDriver_;
  }));


  beforeEach(function () {
      FirebaseHelper.reset();
  });



  it('is accessible', function () {
    expect(SyncDriver).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncDriver).toBe('object');
  });



  // FIXME: implement missing tests. When I (mkretschek) first wrote these,
  // I did not know how to test most methods, since they are, somehow,
  // integrated with Firebase. Now I have some clues on how to isolate them.
  // But this will take some time, which I don't have at the moment.
  describe('SyncDriver.save()', function () {
      it('is accessible', function () {
        expect(SyncDriver.save).toBeDefined();
      });

      it('is a function', function () {
        expect(typeof SyncDriver.save).toBe('function');
      });
  }); // SyncDriver.sync()



  /////////////////////////////////////////////////////////////////////////
  // Change password tests
  /////////////////////////////////////////////////////////////////////////
  describe('SyncDriver.changePassword()', function () {
      var email = 'foo@bar.baz';
      var newPassword = 'newPassword';
      var oldPassword = 'oldPassword';

      it('is accessible', function () {
          expect(SyncDriver.changePassword).toBeDefined();
      });


      it('is a function', function () {
          expect(typeof SyncDriver.changePassword).toBe('function');
      });


      it('calls FirebaseSimpleLogin.prototype.changePassword', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          SyncDriver.changePassword(email, oldPassword, newPassword);

          var changePassword = FirebaseSimpleLoginMock.prototype.changePassword;
          var args = changePassword.calls[0].args;

          expect(changePassword).toHaveBeenCalled();
          expect(changePassword.calls.length).toBe(1);
      });


      it('passes the right arguments to FirebaseSimpleLogin.changePassword', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          SyncDriver.changePassword(email, oldPassword, newPassword);

          var changePassword = FirebaseSimpleLoginMock.prototype.changePassword;
          var args = changePassword.calls[0].args;

          expect(args[0]).toBe(email);
          expect(args[1]).toBe(oldPassword);
          expect(args[2]).toBe(newPassword);
          expect(typeof args[3]).toBe('function');
      });


      // Returns a promise...
      it('returns a then-able', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          var result = SyncDriver.changePassword(email, oldPassword, newPassword);
          expect(result.then).toBeDefined();
      });

      it('resolves the promise if no error is passed to the callback', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          // In this specific test, we don't care for the 3 first parameters...
          FirebaseSimpleLoginMock.prototype.changePassword.andCallFake(function (x, y, z, callback) {
              callback(null);
          });


          var resolved = false;


          runs(function () {
              var result = SyncDriver.changePassword(email, oldPassword, newPassword);

              result.then(function () {
                  resolved = true;
              });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return resolved;
          });
      });

      it('rejects the promise if an error is passed to the callback', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          // In this specific test, we don't care for the 3 first parameters...
          FirebaseSimpleLoginMock.prototype.changePassword.andCallFake(function (x, y, z, callback) {
              callback('An error!');
          });

          var rejected = false;

          runs(function () {
              var result = SyncDriver.changePassword(email, oldPassword, newPassword);

              result.then(null, function () {
                  rejected = true;
              });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });

      it('passes the error message to the promise', function () {
          // Create the FirebaseSimpleLogin object in the SyncDriver.
          SyncDriver.login();

          // In this specific test, we don't care for the 3 first parameters...
          FirebaseSimpleLoginMock.prototype.changePassword.andCallFake(function (x, y, z, callback) {
              callback('An error!');
          });

          var rejected = false;

          runs(function () {
              var result = SyncDriver.changePassword(email, oldPassword, newPassword);

              result.then(null, function (err) {
                  expect(err).toBe('An error!');
                  rejected = true;
              });
          });

          waitsFor(function () {
              $rootScope.$apply();
              return rejected;
          });
      });


      it('rejects the promise if a connection to Firebase was not established',
        function () {
            var rejected = false;

            runs(function () {
                var result = SyncDriver.changePassword(email, oldPassword, newPassword);

                result.then(null, function (err) {
                    expect(err).toBe('Not connected to Firebase!');
                    rejected = true;
                });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });
        });



      describe('password strength check', function () {
          beforeEach(function () {
              SyncDriver.login();
          });

          it('checks that a password has a minimum length', function () {
            var rejected = false;

            runs(function () {
                var result = SyncDriver.changePassword(email, oldPassword, '123');

                result.then(null, function (err) {
                    expect(err).toBe('Password not safe enough');
                    rejected = true;
                });
            });

            waitsFor(function () {
                $rootScope.$apply();
                return rejected;
            });
          });
      }); // password strength check
  }); // SyncDriver.changePassword()




  ////////////////////////////////////////////////////////////////////////////////
  // data warmup
  ////////////////////////////////////////////////////////////////////////////////
  // These tests make sure the application is listening to changes to the
  // warm up data in Firebase.
  describe('data warmup', function () {
      // The _watchWarmupData() method should be considered private. It was
      // exposed solely for testing.

      var baseRef = null;
      var newTimestamp = null;
      var newData = null;

      beforeEach(function () {
          delete localStorage.warmupTimestamp;
          delete localStorage.warmupData;
          baseRef = new FirebaseMock('base');

          newTimestamp = 123456;
          newData = ['foo', 'bar', 'baz'];
      });


      it('logs an error if the user is not connected to Firebase', function () {
          SyncDriver._watchWarmupData(null);
          expect($log.error).toHaveBeenCalledWith('Not connected to Firebase!');
      });


      // Check that .on('value', fn) is called on the timestamp reference
      it('listens to changes to the warmup timestamp in Firebase', function () {
          SyncDriver._watchWarmupData(baseRef);

          var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
          expect(timestampRef).toBeDefined();
          expect(timestampRef.on).toHaveBeenCalled();
          expect(timestampRef.on.calls[0].args[0]).toBe('value');
      });


      it('updates local warmup data if remote timestamp is not the same as the local one',
        function () {
            localStorage.warmupTimestamp = 0;

            SyncDriver._watchWarmupData(baseRef);

            var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
            FirebaseHelper.trigger(timestampRef, 'value', newTimestamp);

            var warmupRef = FirebaseHelper.getRef('base.warmup');
            expect(warmupRef).toBeDefined();
            expect(warmupRef.once).toHaveBeenCalled();
            expect(warmupRef.once.calls[0].args[0]).toBe('value');

            FirebaseHelper.trigger(warmupRef, 'value', {
                timestamp : newTimestamp,
                data : newData
            });
            
            expect(parseInt(localStorage.warmupTimestamp)).toBe(newTimestamp);
            expect(localStorage.warmupData).toBe(JSON.stringify(newData));
        });


      it('does not update if warmup timestamp is the same as the local one', function () {
          localStorage.warmupTimestamp = 0;

          SyncDriver._watchWarmupData(baseRef);

          var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', 0);

          var warmupRef = FirebaseHelper.getRef('base.warmup');
          expect(warmupRef.once).not.toHaveBeenCalled();
      });


      it('stringifies warmup data before storing it locally', function () {
          localStorage.warmupTimestamp = 0;

          SyncDriver._watchWarmupData(baseRef);

          var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
          FirebaseHelper.trigger(timestampRef, 'value', newTimestamp);

          var warmupRef = FirebaseHelper.getRef('base.warmup');
          expect(warmupRef).toBeDefined();
          expect(warmupRef.once).toHaveBeenCalled();
          expect(warmupRef.once.calls[0].args[0]).toBe('value');

          FirebaseHelper.trigger(warmupRef, 'value', {
              timestamp : newTimestamp,
              data : newData
          });
          
          expect(localStorage.warmupData).not.toBe(newData);
          expect(localStorage.warmupData).toBe(JSON.stringify(newData));
      });


      it('DOES NOT broadcast the WarmupDataUpdated if the data is not updated',
        function () {
            var eventBroadcasted = false;

            $rootScope.$on('WarmupDataUpdated', function () {
                eventBroadcasted = true;
            });

            localStorage.warmupTimestamp = 0;

            SyncDriver._watchWarmupData(baseRef);

            var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
            FirebaseHelper.trigger(timestampRef, 'value', 0);

            var warmupRef = FirebaseHelper.getRef('base.warmup');
            expect(warmupRef.once).not.toHaveBeenCalled();

            expect(eventBroadcasted).toBe(false);
        });


      it('broadcasts the WarmupDataUpdated event after the warmup data has been updated',
        function () {
            var eventBroadcasted = false;

            $rootScope.$on('WarmupDataUpdated', function () {
                eventBroadcasted = true;
            });

            runs(function () {
                localStorage.warmupTimestamp = 0;

                SyncDriver._watchWarmupData(baseRef);

                var timestampRef = FirebaseHelper.getRef('base.warmup.timestamp');
                FirebaseHelper.trigger(timestampRef, 'value', newTimestamp);

                var warmupRef = FirebaseHelper.getRef('base.warmup');

                FirebaseHelper.trigger(warmupRef, 'value', {
                    timestamp : newTimestamp,
                    data : newData
                });
            });


            waitsFor(function () {
                // No promises involved, no need to call scope.$apply();
                return eventBroadcasted;
            });
        });


        // FIXME need to implement this test once the warmup is integrated to
        // the login process and we are able to properly test it. Login should
        // probably be refactored in the process (hopefully).
        //
        // Must check if SyncDriver._watchWarmupData() is called sometime
        // during the login process (after a successful login).
        it('is done when the user logs in');
  }); // data warmup

});
