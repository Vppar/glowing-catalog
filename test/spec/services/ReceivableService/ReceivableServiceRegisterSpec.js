// FIXME - This test suit needs a full review
xdescribe('Service: ReceivableServiceRegisterSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.warn = jasmine.createSpy('log.warn');

        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_Receivable_, _ReceivableService_, _$rootScope_) {
        Receivable = _Receivable_;
        ReceivableService = _ReceivableService_;
        $rootScope = _$rootScope_;
    }));

    it('should create a receivable instance', function() {
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

});
