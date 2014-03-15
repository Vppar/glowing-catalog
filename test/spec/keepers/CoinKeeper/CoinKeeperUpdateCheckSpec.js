'use strict';

ddescribe('Service: CoinKeeperUpdateCheck', function() {

    var ExpensesKeeper = null;
    var Expense = null;
    var JournalEntry = null;
    var ArrayUtils = {};
    var IdentityService = null;
    var fakeNow = null;
    var monthTime = 2592000;
    var validExpense = null;
    var jKeeper = {};
    var CoinKeeper = null;
    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    
    
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
        module('tnt.catalog.payment.entity');

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
                duedate : 138617910000,
                amount : 150,
                state : 1
            };

        validExpense = {
            uuid : uuid,
            created : created,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount,
            payment : payment
        };

        ArrayUtils.find = jasmine.createSpy('ArrayUtils.find').andReturn(validExpense);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('ArrayUtils', ArrayUtils);
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

    it('should add a expense', function() {
        

        spyOn(IdentityService, 'getUUID').andReturn(uuid);

        // given
        var expense = new Expense(validExpense);
        expense.payment.state = 2;
        var tstamp = fakeNow;// / 1000;
        var entry = new JournalEntry(null, tstamp, 'expenseUpdateCheck', 1, expense);
        var check =  {
            uuid : uuid,
            bank : 1234,
            agency : 123,
            account : 12,
            number : 1,
            duedate : 138617910000,
            amount : 150,
            state : 2
        };
        // when
            var calls = function(){
                ExpensesKeeper.changeState(check);
            };

        // then
        expect(calls).not.toThrow();
//        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});
