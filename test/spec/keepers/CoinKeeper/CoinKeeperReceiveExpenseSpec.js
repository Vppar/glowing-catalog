'use strict';

describe('Service: CoinKeeperReceiveExpensesSpec', function() {

    var Expense = null;
    var ExpenseKeeper = null;
    var JournalEntry = null;
    var fakeNow = null;
    var validExpense = null;
    var monthTime = 2592000;
    var IdentityService = {};
    var jKeeper = {};
    var fakeUUID = {};
    var keeperName = 'sarava';

    // mock and stubs
    beforeEach(function() {

        fakeNow = 1386179100000;
        
        var type = 'my type';
        var created = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;

        validExpense = {
            uuid : 1,
            created : created,
            entityId : 1,
            documentId : 2,
            type : type,
            duedate : duedate,
            amount : amount
        };
        
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        fakeUUID= '123456-4646231231-6465';
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        IdentityService.getUUIDData = jasmine.createSpy('IdentityService.getUUIDData').andReturn({deviceId: 1});
        IdentityService.getDeviceId = jasmine.createSpy('IdentityService.getDeviceId').andReturn(1);
    });
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
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
            uuid : 1,
            liquidated : fakeNow
        };

        var tstamp = fakeNow;
        var receiveEntry = new JournalEntry(null, tstamp, keeperName + 'Liquidate', 1, recEv);

        ExpenseKeeper.handlers[keeperName + 'AddV1'](liqEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(liqEv.uuid, fakeNow);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });

    it('shouldn\'t receive a payment to a expense', function() {

        var addEv = new Expense(validExpense);

        ExpenseKeeper.handlers[keeperName + 'AddV1'](addEv);

        // when
        var receiveCall = function() {
            ExpenseKeeper.liquidate(5, fakeNow);
        };

        expect(receiveCall).toThrow('Unable to find a ' + keeperName + ' with uuid=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle a receive payment event', function() {
        var expense = new Expense(validExpense);
        var recEv = {
            uuid : 1,
            liquidated : fakeNow
        };
        ExpenseKeeper.handlers[keeperName + 'AddV1'](expense);

        // when
        ExpenseKeeper.handlers[keeperName + 'LiquidateV1'](recEv);

        var result = ExpenseKeeper.read(expense.uuid);

        // then
        expect(result.liquidated).toBe(fakeNow);
    });

    it('shouldn\'t handle a receive payment event', function() {

        var expense = new Expense(validExpense);
        var recEv = {
            uuid : 5,
            payed : fakeNow
        };
        ExpenseKeeper.handlers[keeperName + 'AddV1'](expense);

        // when
        var receiveCall = function() {
            ExpenseKeeper.handlers[keeperName + 'LiquidateV1'](recEv);
        };

        // then
        expect(receiveCall).toThrow('Unable to find a ' + keeperName + ' with uuid=\'5\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
