describe('Service: UserService', function() {
    'use strict';
 
    // instantiate service
    var UserService = null;
    var $q = {};
    var scope = {};
    var md5 = {};
    var SyncService = {};
    var SyncDriver = {};
    var PrefetchService = {};

    // load the service's module
    beforeEach(function() {
        module('angular-md5');
        module('tnt.catalog.user');
        module(function($provide) {
            $provide.value('SyncService', SyncService);
            $provide.value('SyncDriver', SyncDriver);
            $provide.value('PrefetchService', PrefetchService);
        });
        delete localStorage.hashMD5;

        SyncDriver.login = jasmine.createSpy('SyncDriver.login');
        SyncDriver.logout = jasmine.createSpy('SyncDriver.logout');
        SyncDriver.changePassword = jasmine.createSpy('SyncDriver.changePassword');
        SyncService.resync = jasmine.createSpy('SyncService.resync');

    });

    beforeEach(inject(function(_UserService_, _$q_, _$rootScope_, _md5_) {
        UserService = _UserService_;
        $q = _$q_;
        scope = _$rootScope_;
        md5 = _md5_;

        PromiseHelper.config($q, angular.noop);
    }));

    it('should instantiate service', function() {
        expect(!!UserService).toBe(true);
    });

    it('should call loggedIn', function() {
        UserService.loginOnline = jasmine.createSpy('loginOnline').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve();
            }, 0);

            return deferred.promise;
        });

        UserService.loggedIn = jasmine.createSpy('loggedIn');

        var user = 'usertest';
        var pass = 'passtest';
        var result = null;
        // when
        runs(function() {
            UserService.login(user, pass, false).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        runs(function() {
            expect(result).toBe(true);
            expect(UserService.loggedIn).toHaveBeenCalledWith(user, pass);
        });

    });

    it('should call loginOffline', function() {
        UserService.loginOnline = jasmine.createSpy('loginOnline').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.reject();
            }, 0);

            return deferred.promise;
        });

        UserService.loginOffline = jasmine.createSpy('loginOffline').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve();
            }, 0);

            return deferred.promise;
        });
        ;

        var user = 'usertest';
        var pass = 'passtest';
        var result = null;
        // when
        runs(function() {
            UserService.login(user, pass, false).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        runs(function() {
            expect(UserService.loginOffline).toHaveBeenCalledWith(user, pass);
        });

    });

    it('should call loginOffline return rejected promise', function() {
        UserService.loginOnline = jasmine.createSpy('loginOnline').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.reject();
            }, 0);

            return deferred.promise;
        });

        UserService.loginOffline = jasmine.createSpy('loginOffline').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.reject();
            }, 0);

            return deferred.promise;
        });

        var user = 'wronguser';
        var pass = 'wrongpass';
        var result = null;
        // when
        runs(function() {
            UserService.login(user, pass, false).then(null, function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        runs(function() {
            expect(UserService.loginOffline).toHaveBeenCalledWith(user, pass);
        });

    });

    it('should generate hashMD5', function() {

        var user = 'usertest';
        var pass = 'passtest';
        var actual = UserService.loggedIn(user, pass);
        var SALT = '7un7sC0rp';

        var expected = md5.createHash(user + ':' + SALT + ':' + pass);

        expect(actual).toBe(expected);

    });

    it('should login offline', function() {

        var user = 'usertest';
        var pass = 'passtest';
        var SALT = '7un7sC0rp';

        localStorage.hashMD5 = md5.createHash(user + ':' + SALT + ':' + pass);

        var actual = UserService.loginOffline(user, pass);

        expect(actual).toBe(true);

    });

    it('should not login offline', function() {

        localStorage.hashMD5 = md5.createHash('usertest:7un7sC0rp:passtest');

        var user = 'usertest';
        var pass = 'bla';
        var actual = UserService.loginOffline(user, pass);
        var result = null;

        runs(function() {
            actual.then(null, function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        });

        runs(function() {
            expect(result).toBe(true);
        });

    });






    //////////////////////////////////////////////////////////////////////////
    // UserService.changePassword()
    //////////////////////////////////////////////////////////////////////////

    describe('.changePassword()', function () {
        var email = 'foo@bar.baz';
        var oldPassword = 'oldPassword';
        var newPassword = 'newPassword';


        beforeEach(function () {
            SyncDriver.changePassword.andCallFake(PromiseHelper.resolved(true));
            localStorage.user = email;
            delete localStorage.hashMD5;
        });



        it('is accessible', function () {
            expect(UserService.changePassword).toBeDefined();
        });

        it('is a function', function () {
            expect(typeof UserService.changePassword).toBe('function');
        });


        it('changes the password for the current user', function () {
            localStorage.user = email;
            UserService.changePassword(oldPassword, newPassword);
            expect(SyncDriver.changePassword).toHaveBeenCalled();
            var args = SyncDriver.changePassword.calls[0].args;
            expect(args[0]).toBe(localStorage.user);
        });

        it('returns a promise', function () {
            var result = UserService.changePassword(oldPassword, newPassword);
            // Should return a then-able
            expect(typeof result.then).toBe('function');
        });


        it('resolves the promise if the password is successfully changed',
          function () {
              // Our mock should be simulating a successfull password change by
              // default.

              var resolved = false;

              runs(function () {
                  var result = UserService.changePassword(oldPassword, newPassword);
                  result.then(function () {
                      resolved = true;
                  });
              });

              waitsFor(function () {
                  scope.$apply();
                  return resolved;
              });


              runs(function () {
                  expect(SyncDriver.changePassword).toHaveBeenCalled();
              });
          });


        it('updates the user MD5 hash when the password is successfully changed',
          function () {
              function getHash() {
                  return localStorage.hashMD5;
              }

              var resolved = false;

              runs(function () {
                  var oldHash = getHash();

                  var result = UserService.changePassword(oldPassword, newPassword);

                  result.then(function () {
                      var newHash = getHash();
                      expect(newHash).not.toEqual(oldHash);
                      resolved = true;
                  });
              });

              waitsFor(function () {
                  scope.$apply();
                  return resolved;
              });
          });


        it('rejects the promise if the password is not changed', function () {
            SyncDriver.changePassword.andCallFake(PromiseHelper.rejected('An error!'));

            var rejected = false;

            runs(function () {
                var result = UserService.changePassword(oldPassword, newPassword);
                result.then(null, function (err) {
                    expect(err).toBe('An error!');
                    rejected = true;
                });
            });

            waitsFor(function () {
                scope.$apply();
                return rejected;
            });
        });


        it('passes the old and the new password to SyncDriver.changePassword()',
          function () {
              UserService.changePassword(oldPassword, newPassword);

              var args = SyncDriver.changePassword.calls[0].args;

              expect(args[0]).toBe(localStorage.user);
              expect(args[1]).toBe(oldPassword);
              expect(args[2]).toBe(newPassword);
          });
    }); // .changePassword()
    
});
