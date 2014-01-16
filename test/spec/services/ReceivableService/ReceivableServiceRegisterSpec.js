describe('Service: ReceivableServiceRegisterSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ReceivableKeeper = {};

    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('ReceivableKeeper', ReceivableKeeper);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    it('should create a receivable instance', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add');
        ReceivableService.isValid = jasmine.createSpy('ReceivableService.isValid').andReturn(true);
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var result = ReceivableService.register(receivable);

        // then
        expect(ReceivableKeeper.add).toHaveBeenCalledWith(receivable);
        expect(result).toBe(true);
    });

    it('shouldn\'t create a receivable instance', function() {
        // given
        ReceivableKeeper.add = jasmine.createSpy('ReceivableKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var receivable = {
            stub : 'I\'m a stub'
        };

        // when
        var result = null;
        var registerCall = function() {
            result = ReceivableService.register(receivable);
        };

        // then
        expect(registerCall).not.toThrow();
        expect(result).toBe(false);
    });

});
