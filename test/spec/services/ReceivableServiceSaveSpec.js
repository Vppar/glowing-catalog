describe('Service: PaymentServiceSpec', function() {

    var receivable = {};

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
        receivable = {mock: 'I\'m a mock'};
    }));
    
    /**
     * Given a valid receivable
     * and a valid ID - ?
     * and a valid date - ?
     * when a save is triggered
     * then a receivable must be saved to the database
     * and the id must be returned
     */
    it('should save a receivable', function() {
        // given
        receivable.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        
        // when
        var id = ReceivableService.save(receivable);
        
        // then
       expect(receivable.isValid).toHaveBeenCalled();
       expect(DataProvider.receivables[DataProvider.receivables.length - 1]).toBe(receivable);
       expect(id).toBe(DataProvider.receivables.length - 1);
    });
    
    /**
     * Given an invalid receivable
     * when a save is triggered
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t save a receivable instance', function() {
        // given
        receivable.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(false);
        
        var receivables = DataProvider.receivables;
        
        // when
        var id = ReceivableService.save(receivable);
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(DataProvider.receivables).toEqual(receivables);
        expect(id).toBeUndefined();
        
    });
    
});