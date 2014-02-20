'use strict';

describe('Service: UserServiceLoginOfflineScenario', function() {

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
    // dependence injection
    
    beforeEach(inject(function(_UserService_, _$q_, _$rootScope_) {
        UserService = _UserService_;
        $q = _$q_;
        scope = _$rootScope_;
    }));
    
    // mock stuff
    beforeEach(function() {
        SyncDriver.registerSyncService = jasmine.createSpy('SyncDriver.registerService');
        SyncDriver.logout = jasmine.createSpy('SyncDriver.logout');
        PrefetchService.doIt = jasmine.createSpy('PrefetchService.doIt');
        md5.createHash = jasmine.createSpy('md5.createHash').andCallFake(function() {
            return user + pass;
        });
        SyncDriver.login = jasmine.createSpy('SyncDriver.login').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.reject();
            }, 0);
            return deferred.promise;
        });
    });

   

    describe('When instanciate service', function() {
        it('should be accessible', function() {
            expect(!!UserService).toBe(true);
        });
    });

    describe('When login is triggered with valid previous storage credentials and device is offline', function() {
        beforeEach(function() {
            user = 'usertest';
            pass = 'passtest';

            localStorage.hashMD5 = user + pass;
            spyOn(UserService, 'loginOffline').andCallThrough();
            spyOn(UserService, 'onlineLoginErrorHandler').andCallThrough();  
            
            // when
            runs(function() {
                UserService.login(user, pass, false).then(function() {
                    result = true;
                }, function() {
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
                expect(UserService.loginOffline).toHaveBeenCalled();
                expect(logged).toBe(true);
            });
        });

    });

    describe('When login is triggered with invalid previous storage credentials and device is offline', function() {
        beforeEach(function() {
            user = 'usertest';
            pass = 'passtest';

            localStorage.hashMD5 = 'eslovaquia';

            // mock function to simulate a firebase error INVALID_PASSWORD
            spyOn(UserService, 'loginOffline').andCallThrough();
            spyOn(UserService, 'onlineLoginErrorHandler').andCallThrough();  
            
        });
        
        it('should not login', function() {
            runs(function() {
                UserService.login(user, pass, false).then(null, function() {
                    result = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return result;
            }, 'UserService.login');
            
            runs(function() {
                var logged = UserService.isLogged();
                expect(logged).toBe(false);
            });
        });

        it('should not erase persited pass', function() {
            runs(function() {
                UserService.login(user, pass, false).then(null, function() {
                    result = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return result;
            }, 'UserService.login');
            
            runs(function() {
                var logged = UserService.isLogged();
                expect(localStorage.hashMD5).not.toBe(undefined);
                expect(logged).toBe(false);
                
            });
        });
    });

});
