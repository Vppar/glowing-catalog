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


});
