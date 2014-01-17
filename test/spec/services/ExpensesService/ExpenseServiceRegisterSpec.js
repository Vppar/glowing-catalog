describe('Service: ExpenseServiceRegisterSpec', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var ExpenseKeeper = {};
    var CoinKeeper = function() {
        return ExpenseKeeper;
    };
    
    // load the service's module
    beforeEach(function() {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        log.debug = jasmine.createSpy('log.debug');

        module('tnt.catalog.service.expense');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.keeper');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    it('should create a expense instance', function() {
        // given
        ExpenseKeeper.add = jasmine.createSpy('ExpenseKeeper.add');
        ExpenseService.isValid = jasmine.createSpy('ExpenseService.isValid').andReturn(true);
        var expense = {
            stub : 'I\'m a stub'
        };

        // when
        var result = ExpenseService.register(expense);

        // then
        expect(ExpenseKeeper.add).toHaveBeenCalledWith(expense);
        expect(result).toBe(true);
    });

    it('shouldn\'t create a expense instance', function() {
        // given
        ExpenseKeeper.add = jasmine.createSpy('ExpenseKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var expense = {
            stub : 'I\'m a stub'
        };

        // when
        var result = null;
        var registerCall = function() {
            result = ExpenseService.register(expense);
        };

        // then
        expect(registerCall).not.toThrow();
        expect(result).toBe(false);
    });

});
