// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperListExpense', function() {

    var ExpenseKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    beforeEach(inject(function(CoinKeeper) {
        ExpenseKeeper = CoinKeeper('expense');
    }));

    /**
     * <pre>
     * Given a filled CoinKeeperExpense     
     * When list is triggered
     * Then the target expense should be returned
     * </pre>
     */
    it('should return a list of expense', function() {
        // given
        var myExpenseEv = {
            entityId : 1,
            documentId : 2
        };
        var yourExpenseEv = {
            entityId : 2,
            documentId : 1
        };

        ExpenseKeeper.handlers['expenseAddV1'](myExpenseEv);
        ExpenseKeeper.handlers['expenseAddV1'](yourExpenseEv);

        // when
        var expenses = ExpenseKeeper.list();

        // then
        expect(myExpenseEv.entityId).toEqual(expenses[0].entityId);
        expect(myExpenseEv.documentId).toEqual(expenses[0].documentId);
        expect(yourExpenseEv.entityId).toEqual(expenses[1].entityId);
        expect(yourExpenseEv.documentId).toEqual(expenses[1].documentId);
    });

    /**
     * <pre>
     * Givenan empty CoinKeeperExpense    
     * When an get is triggered
     * Then an empty array must be returned
     * </pre>
     */
    it('shouldn\'t return a expense', function() {
        // given

        // when
        var expenses = ExpenseKeeper.list();

        // then
        expect(expenses.length).toBe(0);
    });

});