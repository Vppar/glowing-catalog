describe('Service: ExpenseServiceListSpec', function() {

    var ExpenseKeeper = {};
    var CoinKeeper = function() {
        return ExpenseKeeper;
    };
    var log = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.expense');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.keeper');

        log.debug = jasmine.createSpy('log.debug');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    it('should return full list copy', function() {
        // given
        var dummyExpenses = [
            {
                bla : 'bla'
            }
        ];
        ExpenseKeeper.list = jasmine.createSpy('ExpenseKeeper.list').andReturn(dummyExpenses);

        // when
        var expenses = ExpenseService.list();

        // then
        expect(ExpenseKeeper.list).toHaveBeenCalled();
        expect(expenses).toEqual(dummyExpenses);
    });

    it('shouldn\'t return full list copy', function() {
        // given
        ExpenseKeeper.list = jasmine.createSpy('ExpenseKeeper.list').andCallFake(function() {
            throw 'my exception';
        });

        // when
        var result = {};
        var expenseCall = function() {
            result = ExpenseService.list();
        };

        // then
        expect(expenseCall).not.toThrow();
        expect(log.debug).toHaveBeenCalledWith('ExpenseService.list: Unable to recover the list of expense. Err=my exception');
        expect(result).toEqual(null);
    });
});