describe('Service: ExpenseServiceisValid', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var monthTime = 2592000;
    var DialogService = {};
    var CoinKeeper = function(){};

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.service.expense');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        log.debug = jasmine.createSpy('$log.debug');

        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('DialogService', DialogService);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;        
    }));

    /**
     * <pre>
     * Given a valid expense
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a expense instance', function() {
        // given
        var expense = {
            creationdate : fakeNow,
            entityId : 1,
            type : 'BRINDE',
            amount : 1234.56,
            installmentSeq : 1,
            duedate : fakeNow + monthTime
        };
        // when
        var result = ExpenseService.isValid(expense);

        // then
        expect(result.length).toBe(0);
    });

    /**
     * <pre>
     * Given a invalid expense
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a expense instance', function() {
        // given

        var expense = {
            creationdate : fakeNow + monthTime,
            amount : -1234.56,
            duedate : fakeNow - monthTime
        };

        // when
        var result = ExpenseService.isValid(expense);

        // then
        expect(result.length).toBeGreaterThan(0);
    });

});