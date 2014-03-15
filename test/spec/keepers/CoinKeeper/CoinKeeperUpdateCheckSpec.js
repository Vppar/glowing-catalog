'use strict';

ddescribe('Service: CoinKeeperUpdateCheck', function() {

    var ExpensesKeeper = null;
    var Expense = null;
    var JournalEntry = null;
    var IdentityService = null;
    var fakeNow = null;
    var monthTime = 2592000;
    var validExpense = null;
    var jKeeper = {};
    var CoinKeeper = null;

    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.identity');

        fakeNow = 138617910000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        var entityId = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var documentId = 2;
        var type = 'check';
        var created = fakeNow;
        var duedate = fakeNow + monthTime;
        var amount = 1234.56;
        var payment =  {
                uuid : uuid,
                bank : 1234,
                agency : 123,
                account : 12,
                number : 1,
                duedate : date,
                amount : 150,
                state : 1
            };

        validExpense = {
            created : created,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount
        };

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Expense_, _CoinKeeper_, _JournalEntry_, _IdentityService_) {
        Expense = _Expense_;
        ExpensesKeeper = _CoinKeeper_('expense');
        CoinKeeper = _CoinKeeper_;
        JournalEntry = _JournalEntry_;
        IdentityService = _IdentityService_;        
    }));

    it('should return the same entity', function() {
        expect(CoinKeeper('expense')).toBe(CoinKeeper('expense'));
    });

    it('should add a expense', function() {
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';

        spyOn(IdentityService, 'getUUID').andReturn(uuid);

        // given
        validExpense.uuid = uuid;
        var expense = new Expense(validExpense);
        
        var tstamp = fakeNow;// / 1000;
        var entry = new JournalEntry(null, tstamp, 'expenseAdd', 1, expense);

        // when
        var addCall = function() {
            ExpensesKeeper.add(expense);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});
