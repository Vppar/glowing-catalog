describe('Service: ExpenseServiceSaveSpec', function() {

    var expense = {};
    var expenseId = 1;
    var log = {};

    // load the service's module
    beforeEach(function() {
        var dpStub = {expenses : [] };
        
        expense = {stub: 'I\'m a stub'};
        expense.getNextId = jasmine.createSpy('ExpenseCtrl.getNextId').andReturn(expenseId);
        
        log.error = jasmine.createSpy('$log.error');
        
        module('tnt.catalog.service.expense');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ExpenseService_) {
        DataProvider = _DataProvider_;
        ExpenseService = _ExpenseService_;
    }));
    
    
    /**
     * Given a valid expense
     * and a valid ID - ?
     * and a valid date - ?
     * when a save is triggered
     * then a expense must be saved to the database
     * and the id must be returned
     */
    it('should save a expense', function() {
        // given
        expense.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
        
        // when
        var id = ExpenseService.save(expensevable);
        
        var lastExpense = DataProvider.expenses.pop();
        
        // then
        expect(expense.isValid).toHaveBeenCalled();
        expect(expense.getNextId).toHaveBeenCalled();
        expect(lastExpense).toBe(expense);
        expect(id).toBe(expenseId);
    });
    
    /**
     * Given an invalid expense
     * when a save is triggered
     * then we must log: invalid expense: {}
     */
    it('shouldn\'t save an invalid expense instance', function() {
        // given
        expense.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(false);
        
        var expenses = angular.copy(DataProvider.expenses);
        
        // when
        var id = ExpenseService.save(expense);
        
        // then
        expect(expense.isValid).toHaveBeenCalled();
        expect(expense.getNextId).not.toHaveBeenCalled();
        expect(DataProvider.expenses).toEqual(expenses);
        expect(log.error).toHaveBeenCalled('ExpenseCtrl: -Invalid expense: ' + JSON.stringify(expense));
        expect(id).toBeUndefined();
    });
    
});