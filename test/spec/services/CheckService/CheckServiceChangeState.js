describe('Service: CheckServiceChangeStateSpec', function() {

    var CheckKeeper = null;
    var $q = null;

    // mock and stub
    beforeEach(function() {
        CheckKeeper = {};
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.check.service');
        module('tnt.catalog.check.entity');

        module(function($provide) {
            $provide.value('CheckKeeper', CheckKeeper);
        });
    });

    beforeEach(inject(function(_Check_, _CheckService_, _$q_, _$rootScope_) {
        Check = _Check_;
        CheckService = _CheckService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    it('should change the state', function() {
        // given
        CheckKeeper.changeState = jasmine.createSpy('CheckKeeper.changeState').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return deferred.promise;
        });
        

        var checkEntry = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            bank : 1,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895),
            amount : 123456
        };
        
        checkEntry = new Check(checkEntry);
        checkEntry.state = 1;

        CheckKeeper.read = jasmine.createSpy('CheckKeeper.read').andReturn(checkEntry);
        
        var result = null;
        // when
        runs(function() {
            CheckService.changeState(uuid, 3).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(CheckKeeper.changeState).toHaveBeenCalledWith(uuid, 3);
        });
    });
    
    it('shouldn\'t change the state, wrong uuid', function() {
        // given
        CheckKeeper.changeState = jasmine.createSpy('CheckKeeper.changeState').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return deferred.promise;
        });

        CheckKeeper.read = jasmine.createSpy('CheckKeeper.read').andReturn('derp');
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var result = null;
        // when
        runs(function() {
            CheckService.changeState(uuid, 4).then(0,function(error) {
                result = error;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(CheckKeeper.changeState).not.toHaveBeenCalled();
            expect(result).toBe('Couldn\'t find a check for the uuid: cc02b600-5d0b-11e3-96c3-010001000001');
        });
    });
    
    it('shouldn\'t change the state, ilegal state transition', function() {
        // given
        CheckKeeper.changeState = jasmine.createSpy('CheckKeeper.changeState').andCallFake(function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, 0);
            return deferred.promise;
        });

        var checkEntry = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            bank : 1,
            agency : 12,
            account : 123,
            number : 1234,
            duedate : new Date(1386444467895),
            amount : 123456
        };
        
        checkEntry = new Check(checkEntry);
        checkEntry.state = 1;
        CheckKeeper.read = jasmine.createSpy('CheckKeeper.read').andReturn(checkEntry);
        
        var result = null;
        // when
        runs(function() {
            CheckService.changeState(uuid, 4).then(0,function(error) {
                result = error;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return result;
        });

        // then
        runs(function() {
            expect(CheckKeeper.changeState).not.toHaveBeenCalled();
            expect(result).toBe('Invalid transition from "1" to "4"');
        });
    });
});
