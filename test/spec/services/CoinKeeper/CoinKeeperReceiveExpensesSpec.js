'use strict';

describe('Service: CoinKeeperReceiveExpense', function() {

    var Expense = null;
    var ExpenseKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;
    var validExpense = null;
    var monthTime = 2592000;
    var jKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;

        var type = 'my type';
        var created = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;

        validExpense = {
            id : 1,
            created : created,
            entityId : 1,
            documentId : 2,
            type : type,
            duedate : duedate,
            amount : amount
        };

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Expense_, CoinKeeper, _JournalEntry_) {
        Expense = _Expense_;
        ExpenseKeeper = CoinKeeper('expense');
        JournalEntry = _JournalEntry_;
    }));

    it('should receive a payment to a expense', function() {

        var liqEv = new Expense(validExpense);
        var recEv = {
            id : 1,
            payed : fakeNow
        };

        var tstamp = fakeNow / 1000;
        var receiveEntry = new JournalEntry(null, tstamp, 'expenseLiquidateV1', 1, recEv);

        ExpenseKeeper.handlers['expenseAddV1'](liqEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(liqEv.id, fakeNow);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });

    it('shouldn\'t receive a payment to a expense', function() {

        var addEv = new Expense(validExpense);

        ExpenseKeeper.handlers['expenseAddV1'](addEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(5, fakeNow);
        };

        expect(receiveCall).toThrow('Unable to find a expense with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle a receive payment event', function() {
        var expense = new Expense(validExpense);
        var recEv = {
            id : 1,
            payed : fakeNow
        };
        ExpenseKeeper.handlers['expenseAddV1'](expense);

        // when
        ExpenseKeeper.handlers['expenseLiquidateV1'](recEv);

        var result = ExpenseKeeper.read(expense.id);

        // then
        expect(result.payed).toBe(fakeNow);
    });

    it('shouldn\'t handle a receive payment event', function() {

        var expense = new Expense(validExpense);
        var recEv = {
            id : 5,
            payed : fakeNow
        };
        ExpenseKeeper.handlers['expenseAddV1'](expense);

        // when
        var receiveCall = function() {
            ExpenseKeeper.handlers['expenseLiquidateV1'](recEv);
        };

        // then
        expect(receiveCall).toThrow('Unable to find a expense with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
