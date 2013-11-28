describe('Service: ExpenseServiceUpdateSpec', function() {

    var expenseCtrl = {};
    var log = {};

    // load the service's module
    beforeEach(function() {
        expenseCtrl = {stub: 'I\'m mock 2', expense:{id: 2}};
        var dpStub = {
            expenses : [{stub: 'I\'m mock', expense:{id: 1}}]
        };
        
        log.error = jasmine.createSpy('$log.error');
        
        module('tnt.catalog.service.expense');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ExpenseService_) {
        DataProvider = _DataProvider_;
        ExpenseService = _ExpenseService_;
    }));
    
    
    /**
     * Given a valid expense
     * And present on the database
     * when an update is triggered
     * then a expense must be update in the database
     */
    it('should update a expense', function() {
        // given
        expenseCtrl.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
        DataProvider.expenses.push(angular.copy(expenseCtrl));
        
        // when
        expenseCtrl.stub = 'I\'m a new mock 2';
        ExpenseService.update(expenseCtrl);
        
        var lastExpense = DataProvider.expenses.pop();
        
        // then
        expect(expenseCtrl.isValid).toHaveBeenCalled();
        expect(lastExpense).toEqual(expenseCtrl);
    });
    
    /**
     * Given a valid expense
     * And not present on the database
     * when an update is triggered
     * then we must log: Could not find expense to update
     */
    it('shouldn\'t update a expense that is not present', function() {
        // given
        expenseCtrl.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
        
        // when
        expenseCtrl.stub = 'I\'m a new mock 2';
        ExpenseService.update(expenseCtrl);
        
        var lastExpense = DataProvider.expenses.pop();

        // then
        expect(expenseCtrl.isValid).toHaveBeenCalled();
        expect(lastExpense).not.toEqual(expenseCtrl);
        expect(log.error).toHaveBeenCalledWith('Could not find expense to update');
    });
    
    /**
     * Given an invalid expense
     * when an update is triggered
     * then we must log: invalid expense: {}
     */
    it('shouldn\'t update an invalid expense', function() {
     // given
        expenseCtrl.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(false);
        
        // when
        expenseCtrl.stub = 'I\'m a new mock 2';
        ExpenseService.update(expenseCtrl);
        
        var lastExpense = DataProvider.expenses.pop();

        // then
        expect(expenseCtrl.isValid).toHaveBeenCalled();
        expect(lastExpense).not.toEqual(expenseCtrl);
        expect(log.error).toHaveBeenCalledWith('ExpenseService: -Invalid expense:' + JSON.stringify(expenseCtrl));
    });
});