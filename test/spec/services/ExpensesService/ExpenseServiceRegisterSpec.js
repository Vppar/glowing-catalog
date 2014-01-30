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
        module('tnt.catalog.coin.keeper');
        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_Expense_, _ExpenseService_) {
        Expense = _Expense_;
        ExpenseService = _ExpenseService_;
    }));

    it('should create a expense instance', function() {
        // given
        ExpenseKeeper.add = jasmine.createSpy('ExpenseKeeper.add');
        ExpenseKeeper.cancel = jasmine.createSpy('ExpenseKeeper.cancel');
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

    it('should create a expense instance from a existing expense', function() {
        // given
        ExpenseKeeper.add = jasmine.createSpy('ExpenseKeeper.add');
        ExpenseKeeper.cancel = jasmine.createSpy('ExpenseKeeper.cancel');
        ExpenseService.isValid = jasmine.createSpy('ExpenseService.isValid').andReturn(true);

        var entityId = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var documentId = 2;
        var type = 'my type';
        var created = 123456789;
        var duedate = 987654321;
        var amount = 1234.56;

        var instance = {
            id : 1,
            created : created,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount
        };
        var expense = new Expense(instance);

        // when
        var result = ExpenseService.register(expense);

        // then
        expect(ExpenseKeeper.cancel).toHaveBeenCalledWith(expense.id);
        expect(ExpenseKeeper.add).toHaveBeenCalledWith(expense);
        expect(result).toBe(true);
    });

    it('shouldn\'t create a expense instance', function() {
        // given
        ExpenseKeeper.add = jasmine.createSpy('ExpenseKeeper.add').andCallFake(function() {
            throw 'my exception';
        });
        var entityId = 'M A V COMERCIO DE ACESSORIOS LTDA';
        var documentId = 2;
        var type = 'my type';
        var created = 123456789;
        var duedate = 987654321;
        var amount = 1234.56;

        var expense = {
            created : created,
            entityId : entityId,
            documentId : documentId,
            type : type,
            duedate : duedate,
            amount : amount
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
