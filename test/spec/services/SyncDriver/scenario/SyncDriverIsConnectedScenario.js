describe('Service: SyncDriverIsConnectedScenario', function() {

    var SyncDriver = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.sync.driver');
    });

    beforeEach(inject(function(_SyncDriver_) {
        SyncDriver = _SyncDriver_;
    }));

    it('is accessible', function() {
        expect(SyncDriver).not.toBeUndefined();
    });

    it('is a function', function() {
        expect(typeof SyncDriver).toBe('object');
    });

    describe('SyncDriver.isConnected()', function() {
        it('is accessible', function() {
            expect(SyncDriver.isConnected).toBeDefined();
        });

        it('is a function', function() {
            expect(typeof SyncDriver.isConnected).toBe('function');
        });
    }); // SyncDriver.sync()

    describe('when triggered SyncDriver.login with invalid user and invalid password', function() {
        beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            SyncDriver = _SyncDriver_;
        }));

        beforeEach(function() {
            var signedIn = false;
            var loging = function() {
                signedIn = true;
            };
            
            var username = '';
            var password = '';
            
            runs(function() {
                var promise = SyncDriver.login(username, password);
                promise.then(null,loging);
            });

            waitsFor(function() {
                $rootScope.$apply();
                return signedIn;
            }, 'SyncDriver.login()');
        });

        it('isConnected should return true', function() {
            var isConnected = SyncDriver.isConnected();
            expect(isConnected).toBe(false);
        });

    });
    
    describe('when triggered SyncDriver.login with valid user and valid password', function() {

        beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            SyncDriver = _SyncDriver_;
        }));

        beforeEach(function() {
            var signedIn = false;
            var loging = function() {
                signedIn = true;
            };
            
            var username = 'test@fake.acc';
            var password = 'senha123';

            runs(function() {
                var promise = SyncDriver.login(username, password);
                promise.then(loging, loging);
            });

            waitsFor(function() {
                $rootScope.$apply();
                return signedIn;
            }, 'SyncDriver.login()');
        });

        it('isConnected should return true', function() { 
            var isConnected = SyncDriver.isConnected();
            expect(isConnected).toBe(true);
        });

    });
    
    describe('When user login and then logout',function(){
        beforeEach(inject(function(_$rootScope_, _$q_, _SyncDriver_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            SyncDriver = _SyncDriver_;
        }));

        beforeEach(function() {
            var signedIn = false;
            var signedOut = false;
            
            var loging = function() {
                signedIn = true;
            };
            
            var logingOut = function() {
                signedOut = true;
            };
            
            var username = 'test@fake.acc';
            var password = 'senha123';

            runs(function() {
                var promise = SyncDriver.login(username, password);
                promise.then(loging, loging);
            });

            waitsFor(function() {
                $rootScope.$apply();
                return signedIn;
            }, 'SyncDriver.login()');
            
            runs(function() {
                var promise = SyncDriver.logout();
                promise.then(logingOut, null);
            });

            waitsFor(function() {
                $rootScope.$apply();
                return signedOut;
            }, 'SyncDriver.logout()');
        });
        
        it('isConnected should be false',function(){
            expect(SyncDriver.isConnected()).toBe(false);
        });
    });

});
