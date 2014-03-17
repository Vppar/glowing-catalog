describe('Service: ReceivableServiceRead', function() {

    var ReceivableKeeper = {};
    var BookService = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('CoinKeeper', CoinKeeper);
            $provide.value('BookService', BookService);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    it('should return a copy of a receivable', function() {
        // given
        var dummyReceivables = {
            bla : 'bla'
        };
        ReceivableKeeper.read = jasmine.createSpy('ReceivableKeeper.read').andReturn(dummyReceivables);

        // when
        var receivables = ReceivableService.read(1);

        // then
        expect(ReceivableKeeper.read).toHaveBeenCalledWith(1);
        expect(receivables).toEqual(dummyReceivables);
    });

    it('shouldn\'t return a copy of a receivable', function() {
        // given
        ReceivableKeeper.read = jasmine.createSpy('ReceivableKeeper.read').andReturn(null);

        // when
        var receivables = ReceivableService.read(1);

        // then
        expect(ReceivableKeeper.read).toHaveBeenCalledWith(1);
        expect(receivables).toBeNull();
    });
    
    it('should return a copy of check', function() {
        // given
        var dummyReceivables = {
            uuid : 12345,
                type : 'check',
            payment: {
                uudi: 12345
            }
        };
        ReceivableKeeper.read = jasmine.createSpy('ReceivableKeeper.read').andReturn(dummyReceivables);

        // when
        var receivables = ReceivableService.readCheck(12345);

        // then
        expect(ReceivableKeeper.read).toHaveBeenCalledWith(12345);
        expect(receivables).toEqual({ uudi : 12345 });
    });
});