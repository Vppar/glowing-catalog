describe('Service: SyncDriver', function () {

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  var $rootScope = null;
  var SyncDriver = null;

  var FirebaseMock = function () {
  };

  FirebaseMock.prototype = {
      child : function () {
          // Make the calls to child() chainable
          return this;
      },

      on : function () {}
  };


  var FirebaseSimpleLoginMock = function () {
  };

  FirebaseSimpleLoginMock.prototype = {
      changePassword : function () {},
      login : function () {}
  };


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
      $provide.value('Firebase', FirebaseMock);
      $provide.value('FirebaseSimpleLogin', FirebaseSimpleLoginMock);
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



  it('is accessible', function () {
    expect(SyncDriver).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncDriver).toBe('object');
  });



  // FIXME: implement missing tests (not sure how to implement unit tests
  // for the SyncDriver, since most methods are, somehow, integrated with
  // Firebase.
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
  }); // SyncDriver.changePassword()


});
