describe('Service: ReceivableServiceRead', function() {

    var ReceivableKeeper = {};
    var CoinKeeper = function() {
        return ReceivableKeeper;
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.service');
        module(function($provide) {
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));
    
    it('should return a copy of check', function() {
        // given
        var dummyReceivables = {
            uuid : 12345,
                type : 'check',
            payment: {
                uuid: 12345,
                state : 1
            }
        };
        
        var newCheck = { uuid : 12345, state : 2 } ;
        
        ReceivableKeeper.read = jasmine.createSpy('ReceivableKeeper.read').andReturn(dummyReceivables);
        ReceivableKeeper.updateCheck = jasmine.createSpy('ReceivableKeeper.updateCheck');

        // when
        ReceivableService.changeState(12345, 2);

        // then
        expect(ReceivableKeeper.updateCheck).toHaveBeenCalledWith(newCheck);
    });
});