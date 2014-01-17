describe('Service: ReceivableServiceListSpec', function() {

    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');

        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyReceivables = [
            {
                bla : 'bla'
            }
        ];
        ReceivableKeeper.list = jasmine.createSpy('ReceivableKeeper.list').andReturn(dummyReceivables);

        // when
        var receivables = ReceivableService.list();

        // then
        expect(ReceivableKeeper.list).toHaveBeenCalled();
        expect(receivables).toEqual(dummyReceivables);
    });

    it('shouldn\'t return full list copy', function() {
        // given
        ReceivableKeeper.list = jasmine.createSpy('ReceivableKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var receivableCall = function() {
            result = ReceivableService.list();
        };

        // then
        expect(receivableCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('ReceivableService.list: Unable to recover the list of receivables. Err=my exception');
        expect(result).toEqual(null);
    });
});