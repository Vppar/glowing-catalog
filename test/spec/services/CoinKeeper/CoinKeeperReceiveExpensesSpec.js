'use strict';

describe('Service: CoinKeeperReceiveExpense', function() {

    var Expense = null;
    var ExpenseKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;
    var validExpense = null;
    var monthTime = 2592000;
    var jKeeper = {};
    
    var keeperName = 'sarava';

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.coin.keeper');
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
        ExpenseKeeper = CoinKeeper(keeperName);
        JournalEntry = _JournalEntry_;
    }));

    it('should receive a payment to a expense', function() {

        var liqEv = new Expense(validExpense);
        var recEv = {
            id : 1,
            liquidated : fakeNow
        };

        var tstamp = fakeNow / 1000;
        var receiveEntry = new JournalEntry(null, tstamp, keeperName +'Liquidate', 1, recEv);

        ExpenseKeeper.handlers[keeperName +'AddV1'](liqEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(liqEv.id, fakeNow);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });

    it('shouldn\'t receive a payment to a expense', function() {

        var addEv = new Expense(validExpense);

        ExpenseKeeper.handlers[keeperName +'AddV1'](addEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(5, fakeNow);
        };

        expect(receiveCall).toThrow('Unable to find a ' + keeperName + ' with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle a receive payment event', function() {
        var expense = new Expense(validExpense);
        var recEv = {
            id : 1,
            liquidated : fakeNow
        };
        ExpenseKeeper.handlers[keeperName +'AddV1'](expense);

        // when
        ExpenseKeeper.handlers[keeperName +'LiquidateV1'](recEv);

        var result = ExpenseKeeper.read(expense.id);

        // then
        expect(result.liquidated).toBe(fakeNow);
    });

    it('shouldn\'t handle a receive payment event', function() {

        var expense = new Expense(validExpense);
        var recEv = {
            id : 5,
            payed : fakeNow
        };
        ExpenseKeeper.handlers[keeperName +'AddV1'](expense);

        // when
        var receiveCall = function() {
            ExpenseKeeper.handlers[keeperName +'LiquidateV1'](recEv);
        };

        // then
        expect(receiveCall).toThrow('Unable to find a ' + keeperName + ' with id=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
