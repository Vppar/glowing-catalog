describe('Service: ReceivableServiceSpec', function() {

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
     * Given an empty database
     * when a getNextId is triggered
     * then 1 must be returned
     */
    it('should get an id=1', function() {
        // given
        
        // when
        var nextId = ReceivableService.getNextId();
        
        // then
        expect(nextId).toBe(1);
    });
    
    /**
     * Given a populated database
     * when a getNextId is triggered
     * then the next id must be returned
     */
    it('should get an id', function() {
        // given
        DataProvider.receivables.push({mock: 'I\'m mock', receivable:{id: 1}});
        
        // when
        var nextId = ReceivableService.getNextId();
        
        // then
        expect(nextId.isValid).toBe(2);
    });
});