// FIXME - This test suit needs a full review
xdescribe('Service: ReceivableServiceBulkRegisterSpec', function() {

    var log = {};
    var $q = null;
    var uuid = null;
    var fakeNow = 1386444467895;
    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // mock and stub
    beforeEach(function() {
        // spy on datetime and mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        // spy on debug
        log.warn = jasmine.createSpy('log.warn');

        // uuid stub
        uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });

    // injection time !
    beforeEach(inject(function(_Receivable_, _ReceivableService_, _$q_, _$rootScope_) {
        $rootScope = _$rootScope_;
        $q = _$q_;
        Receivable = _Receivable_;
        ReceivableService = _ReceivableService_;
    }));

    // FIXME - This test is right we should update the code to be testable
    it('should register a receivable instance', function() {
        // given
        var result = null;
        var receivable = {
            entityId : 1,
            type : 'receivable',
            amount : 123.45
        };

        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add').andCallFake(function() {
            var deferred = $q.defer();
            // using uuid stubed
            deferred.resolve(uuid);
            return deferred.promise;
        });

        // when
        runs(function() {
            ReceivableService.bulkRegister(receivable).then(function(_result_) {
                result = _result_;
            }, function(_result_) {
                result = _result_;
            });
            $rootScope.$apply();
        });
        waitsFor(function() {
            return result !== null;
        }, 'Register is taking to long', 300);

        // then
        runs(function() {
            expect(result).toBe(uuid);
            expect(ReceivableKeeper.add).toHaveBeenCalledWith(receivable);
        });
    });

    // FIXME - Implement this test
    it('shouldn\'t create a receivable instance', function() {
    });
});
