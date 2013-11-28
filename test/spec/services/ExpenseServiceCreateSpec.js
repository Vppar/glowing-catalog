describe('Service: ExpenseServiceSpec', function() {

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
     * Given no parameters
     * when a create is triggered
     * then an instance of ExpenseCtrl must be returned
     */
    it('should create a expense instance', function() {
        // given
        
        // when
        var expenseCtrl = ExpenseService.create();

        var now = new Date();
        var expense = expenseCtrl.getExpense();
        
        // then
        expect(expense.createdate).toBeGreaterThan(now);
        expect(expense.createdate).toBeLessThan(now + 1000);
        expect(expense.canceled).toBe(false);
    });
    
});