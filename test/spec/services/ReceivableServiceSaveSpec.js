describe('Service: ReceivableServiceSpec', function() {

    var receivable = {};
    var receivableId = 1;

    // load the service's module
    beforeEach(function() {
        var mock = {
            receivables : []
        };
        receivable = {mock: 'I\'m a mock'};
        receivable.getNextId = jasmine.createSpy('ReceivableCtrl.getNextId').andReturn(receivableId);
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
        
        var lastReceivable = DataProvider.receivables.pop();
        
        // then
        expect(receivable.isValid).toHaveBeenCalled();
        expect(receivable.getNextId).toHaveBeenCalled();
        expect(lastReceivable).toBe(receivable);
        expect(id).toBe(receivableId);
    });
    
    /**
     * Given an invalid receivable
     * when a save is triggered
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t save an invalid receivable instance', function() {
        // given
        receivable.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(false);
        
        var receivables = angular.copy(DataProvider.receivables);
        
        // when
        var id = ReceivableService.save(receivable);
        
        // then
        expect(receivable.isValid).toHaveBeenCalled();
        expect(receivable.getNextId).not.toHaveBeenCalled();
        expect(DataProvider.receivables).toEqual(receivables);
        expect(id).toBeUndefined();
    });
    
});