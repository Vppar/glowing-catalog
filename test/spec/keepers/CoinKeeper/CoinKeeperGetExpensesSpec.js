// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperGetExpenseSpec', function() {

    var ExpenseKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(CoinKeeper) {
        ExpenseKeeper = CoinKeeper('expense');
    }));

    /**
     * <pre>
     * Given a existing expense id     
     * When an get is triggered
     * Then the target expense should be returned
     * </pre>
     */
    it('should return a expense', function() {
        // given
        var myExpense = {
            id : 1,
            entityId : 2
        };
        var yourExpense = {
            id : 2,
            entityId : 1
        };
        ExpenseKeeper.handlers['expenseAddV1'](myExpense);
        ExpenseKeeper.handlers['expenseAddV1'](yourExpense);
        var expenses = ExpenseKeeper.list();

        // when
        var myResult = ExpenseKeeper.read(expenses[0].id);
        var yourResult = ExpenseKeeper.read(expenses[1].id);

        // then
        expect(myExpense).not.toBe(myResult);
        expect(yourExpense).not.toBe(yourResult);
        expect(myExpense.entityId).toBe(myExpense.entityId);
        expect(yourExpense.entityId).toBe(yourResult.entityId);

    });

    /**
     * <pre>
     * Given a missing expense id     
     * When an get is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a expense', function() {
        // given
        var myExpense = {
            id : 1,
            entityId : 2
        };
        ExpenseKeeper.handlers['expenseAddV1'](myExpense);

        // when
        var myResult = ExpenseKeeper.read(123);

        // then
        expect(myResult).toBe(null);
    });

});
