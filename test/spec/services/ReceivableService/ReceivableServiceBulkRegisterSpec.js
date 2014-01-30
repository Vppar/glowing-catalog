describe('Service: ReceivableServiceRegisterSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_Receivable_, _ReceivableService_) {
        Receivable = _Receivable_;
        ReceivableService = _ReceivableService_;
    }));

    it('should create a receivable instance', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add');
        ReceivableService.isValid = jasmine.createSpy('ReceivableService.isValid').andReturn([]);
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var result = ReceivableService.register(receivable);

        // then
        expect(ReceivableKeeper.add).toHaveBeenCalledWith(receivable);
        expect(result.length).toBe(0);
    });

    it('shouldn\'t create a receivable instance', function() {
        // given
        ReceivableService.isValid = jasmine.createSpy('ReceivableKeeper.isValid').andReturn([{}]);
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var receivable = {
            stub : 'I\'m a stub'
        };

        var result = [];
        // when
        var registerCall = function() {
            result = ReceivableService.register(receivable);
        };

        // then
        expect(registerCall).not.toThrow();
        expect(result.length).toBe(1);
    });
    
    it('shouldn\'t create a receivable instance', function() {
        // given
        ReceivableService.isValid = jasmine.createSpy('ReceivableKeeper.isValid').andReturn([]);
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var registerCall = function() {
            ReceivableService.register(receivable);
        };

        // then
        expect(registerCall).toThrow();
    });

});
