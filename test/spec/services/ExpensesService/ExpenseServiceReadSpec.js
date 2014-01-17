describe('Service: ExpenseServiceRead', function() {

    var ExpenseKeeper = {};
    var CoinKeeper = function() {
        return ExpenseKeeper;
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.expense');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.keeper');
        
        module(function($provide) {
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    it('should return a copy of a expense', function() {
        // given
        var dummyExpenses = {
            bla : 'bla'
        };
        ExpenseKeeper.read = jasmine.createSpy('ExpenseKeeper.read').andReturn(dummyExpenses);

        // when
        var expenses = ExpenseService.read(1);

        // then
        expect(ExpenseKeeper.read).toHaveBeenCalledWith(1);
        expect(expenses).toEqual(dummyExpenses);
    });
    
    it('shouldn\'t return a copy of a expense', function() {
        // given
        ExpenseKeeper.read = jasmine.createSpy('ExpenseKeeper.read').andReturn(null);

        // when
        var expenses = ExpenseService.read(1);

        // then
        expect(ExpenseKeeper.read).toHaveBeenCalledWith(1);
        expect(expenses).toBeNull();
    });
});