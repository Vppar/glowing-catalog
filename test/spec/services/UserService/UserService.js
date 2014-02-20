'use strict';

describe('Service: UserService', function() {
 
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

    });

    beforeEach(inject(function(_UserService_, _$q_, _$rootScope_, _md5_) {
        UserService = _UserService_;
        $q = _$q_;
        scope = _$rootScope_;
        md5 = _md5_;
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
    
});
