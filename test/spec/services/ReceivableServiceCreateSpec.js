describe('Service: ReceivableServiceCreateSpec', function() {

    // load the service's module
    beforeEach(function() {
        var mock = {
            receivables : []
        };
        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', mock);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ReceivableService_) {
        DataProvider = _DataProvider_;
        ReceivableService = _ReceivableService_;
    }));
    
    
    /**
     * Given no parameters
     * when a create is triggered
     * then an instance of ReceivableCtrl must be returned
     */
    it('should create a receivable instance', function() {
        // given
        
        // when
        var receivableCtrl = ReceivableService.create();

        var now = new Date();
        var receivable = receivableCtrl.getReceivable();
        
        // then
        expect(receivable.createdate).toBeGreaterThan(now);
        expect(receivable.createdate).toBeLessThan(now + 1000);
        expect(receivable.canceled).toBe(false);
    });
    
});