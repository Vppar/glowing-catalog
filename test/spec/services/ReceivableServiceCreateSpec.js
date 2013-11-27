describe('Service: PaymentServiceSpec', function() {

    // load the service's module
    beforeEach(function() {
        var mock = {
            receivables : []
        };
        mock.receivables.push = jasmine.createSpy('DataProvider.receivables.push');
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
        var receivable = ReceivableService.create();
        
        // then
        expect(receivable.createdate).not.toBeUndefined();
        expect(receivable.canceled).toBe(false);
        expect(DataProvider.receivables.push).toHaveBeenCalled();
    });
    
});