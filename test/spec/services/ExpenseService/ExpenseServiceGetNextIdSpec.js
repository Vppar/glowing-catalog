xdescribe('Service: ExpenseServiceGetNextIdSpec', function() {

    // load the service's module
    beforeEach(function() {
        var stub = {
            expenses : []
        };
        module('tnt.catalog.service.expense');
        module(function($provide) {
            $provide.value('DataProvider', stub);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ExpenseService_) {
        DataProvider = _DataProvider_;
        ExpenseService = _ExpenseService_;
    }));
    
    
    /**
     * Given an empty database
     * when a getNextId is triggered
     * then 1 must be returned
     */
    it('should get an id=1', function() {
        // given

        // when
        var nextId = ExpenseService.getNextId();

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
        DataProvider.expenses.push({stub: 'I\'m stub', expense:{id: 1}});
        
        // when
        var nextId = ReceivableService.getNextId();
        
        // then
        expect(nextId).toBe(2);
    });
});