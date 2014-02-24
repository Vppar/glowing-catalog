'use strict';

describe('Service: UserServiceLoginOnlineScenario', function() {

    // instantiate service
    var UserService = null;
    var $q = {};
    var scope = {};
    var md5 = {};
    var SyncService = {};
    var SyncDriver = {};
    var PrefetchService = {};
    var user = null;
    var pass = null;
    var result = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.user');
        module(function($provide) {
            $provide.value('SyncService', SyncService);
            $provide.value('SyncDriver', SyncDriver);
            $provide.value('PrefetchService', PrefetchService);
            $provide.value('md5', md5);
        });
    });

    // mock stuff
    beforeEach(function() {
        SyncDriver.registerSyncService = jasmine.createSpy('SyncDriver.registerService');
        SyncDriver.logout = jasmine.createSpy('SyncDriver.logout');
        SyncService.resync = jasmine.createSpy('SyncService.resync');
        PrefetchService.doIt = jasmine.createSpy('PrefetchService.doIt');
        delete localStorage.firebaseConnected;
    });

    // dependence injection
    beforeEach(inject(function(_UserService_, _$q_, _$rootScope_) {
        UserService = _UserService_;
        $q = _$q_;
        scope = _$rootScope_;
    }));

    describe('When instanciate service', function() {
        it('should be accessible', function() {
            expect(!!UserService).toBe(true);
        });
    });

    describe('When login is triggered with valid credentials and device is online', function() {
        localStorage.hashMD5 = null;
        // mock stuff
        beforeEach(function() {
            user = 'usertest';
            pass = 'passtest';
            SyncDriver.isConnected = jasmine.createSpy('SyncDriver.isConnected');
            SyncDriver.login = jasmine.createSpy('SyncDriver.login').andCallFake(function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
                return deferred.promise;
            });

            md5.createHash = jasmine.createSpy('md5.createSpy').andCallFake(function() {
                return user + pass;
            });

        });

        // execute for every scenario
        beforeEach(function() {
            runs(function() {
                UserService.login(user, pass, false).then(function() {
                    result = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return result;
            }, 'UserService.login');

        });

        it('should login properly', function() {
            runs(function() {
                var logged = UserService.isLogged();
                expect(logged).toBe(true);
            });
        });

        it('should persist password in local storage', function() {
            expect(localStorage.hashMD5).not.toBe(undefined);
            expect(localStorage.hashMD5).toEqual(user + pass);
        });
    });

    describe('When login is triggered with invalid credentials and device is online', function() {
        var result = null;
        var newHash = null;

        beforeEach(function() {
            user = 'usertest';
            pass = 'passtest';
            var err = {};

            SyncDriver.login = jasmine.createSpy('SyncDriver.login').andCallFake(function() {
                var deferred = $q.defer();
                err.code = 'INVALID_PASSWORD';
                setTimeout(function() {
                    deferred.reject(err);
                }, 0);
                return deferred.promise;
            });

            md5.createHash = jasmine.createSpy('md5.createSpy').andCallFake(function() {
                return user + pass;
            });
            spyOn(UserService, 'loginOnline').andCallThrough();
            spyOn(UserService, 'loginOffline').andCallThrough();
            spyOn(UserService, 'onlineLoginErrorHandler').andCallThrough();
        });

        beforeEach(function() {
            // when
            runs(function() {
                localStorage.hashMD5 = 'batatinhas';
                newHash = md5.createHash();
                UserService.login(user, pass, false).then(null, function() {
                    result = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return result;
            }, 'UserService.login');
        });

        it('should not login', function() {
            runs(function() {
                var logged = UserService.isLogged();
                expect(logged).toBe(false);
                expect(UserService.loginOffline).not.toHaveBeenCalled();
                expect(UserService.onlineLoginErrorHandler).toHaveBeenCalled();
            });
        });

        it('should not persist pass in local storage if the pass is different from stored one', function() {
            runs(function() {
                expect(localStorage.hashMD5).not.toBe(undefined);
                expect(localStorage.hashMD5).not.toEqual(newHash);
            });
        });

    });

    describe('When login is triggered with invalid credentials and device is online', function() {
        var result = null;

        beforeEach(function() {
            user = 'usertest';
            pass = 'passtest';
            var err = {};

            // populate the offline hash
            UserService.loggedIn = jasmine.createSpy('loggedIn');

            localStorage.hashMD5 = user + pass;

            md5.createHash = jasmine.createSpy('md5.createSpy').andCallFake(function() {
                return user + pass;
            });

            // mock function to simulate a firebase error INVALID_PASSWORD
            SyncDriver.login = jasmine.createSpy('SyncDriver.login').andCallFake(function() {
                var deferred = $q.defer();
                err.code = 'INVALID_PASSWORD';
                setTimeout(function() {
                    deferred.reject(err);
                }, 0);
                return deferred.promise;
            });

            // when
            runs(function() {
                UserService.login(user, pass, false).then(null, function() {
                    result = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return result;
            }, 'UserService.login');

        });
        
        it('should delete persisted pass in local storage if the pass is equal from stored one', function() {
            runs(function() {
                expect(localStorage.hashMD5).toBe(undefined);
                expect(UserService.loggedIn).not.toHaveBeenCalled();
            });
        });

        it('should not login', function() {
            runs(function() {
                var logged = UserService.isLogged();
                expect(logged).toBe(false);
                expect(UserService.loggedIn).not.toHaveBeenCalled();
            });
        });
    });
});
