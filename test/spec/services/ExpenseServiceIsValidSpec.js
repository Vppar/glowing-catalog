xdescribe('Service: ExpenseServiceAddSpec', function() {

    // CALL ENTITY ISVALID OS STORAGE GET?

    var log = {};
    var storageStub = {};

    // load the service's module
    beforeEach(function() {

        // mock log
        log.error = jasmine.createSpy('$log.error');

        // storage mock
        storageStub.get = jasmine.createSpy('StorageService.get').andCallFake(function(name, id) {
            var result = false;
            if (name == 'entities') {
                if (id === 17) {
                    result = true;
                }
            }

            return result;
        });

        module('tnt.catalog.service.expense');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });

    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    /**
     * <pre>
     * Given a valid due date
     * and a valid amount
     * and a valid entity
     * When isValid is triggered
     * Then true must be returned
     * </pre>
     */
    it('should consider the object a valid expense', function() {
        var expense = {
            id : 1,
            createdate : 1357948800000,
            duedate : 1388534400000,
            document : {
                number : 979,
                type : 'NOTA FISCAL'
            },
            type : 'BRINDE',
            entityId : 17,
            remarks : 'COMPRA DE BRINDE PARA OS CLIENTES',
            amount : '250.00'
        };

        var isValid = ExpenseService.isValid(expense);

        var today = new Date();

        expect(storageStub.get).toHaveBeenCalledWith('entities',expense.entityId);

        expect(expense.duedate).toBeGreaterThan(expense.createdate);
        expect(expense.duedate).toBeGreaterThan(today);

        expect(expense.amount).toBeGreaterThan(0);

        expect(isValid).toBe(true);
    });

    /**
     * <pre>
     * Given an invalid due date(in the past for instance)
     * When isValid is triggered
     * Then must be logged: 'ExpenseService.isValid: -Invalid date, date={{date}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid expensee', function() {
        var expense = {
            id : 1,
            createdate : 1357948800000,
            duedate : 1347948800000,
            document : {
                number : 979,
                type : 'NOTA FISCAL'
            },
            type : 'BRINDE',
            entityId : 17,
            remarks : 'COMPRA DE BRINDE PARA OS CLIENTES',
            amount : '250.00'
        };

        var isValid = ExpenseService.isValid(expense);

        expect(log.error).toHaveBeenCalledWith('ExpenseService.isValid: -Invalid date, date=' + expense.duedate);

        expect(isValid).toBe(false);
    });

    /**
     * <pre>
     * Given an invalid amount
     * When isValid is triggered
     * Then must be logged: 'ExpenseService.isValid: -Invalid amount, amount={{amount}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid expense', function() {
        var expense = {
            id : 1,
            createdate : 1357948800000,
            duedate : 1388534400000,
            document : {
                number : 979,
                type : 'NOTA FISCAL'
            },
            type : 'BRINDE',
            entityId : 17,
            remarks : 'COMPRA DE BRINDE PARA OS CLIENTES',
            amount : '-50.00'
        };

        var isValid = ExpenseService.isValid(expense);

        expect(log.error).toHaveBeenCalledWith('ExpenseService.isValid: -Invalid amount, amount=' + expense.amount);
        expect(isValid).toBe(false);
    });

    /**
     * <pre>
     * Given an invalid entity
     * When isValid is triggered
     * Then must be logged: 'ExpenseService.isValid: -Invalid entity, entity={{entity}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t consider the object a valid expense', function() {

        var expense = {
            id : 1,
            createdate : 1357948800000,
            duedate : 1388534400000,
            document : {
                number : 979,
                type : 'NOTA FISCAL'
            },
            type : 'BRINDE',
            entityId : 20, // mocked to not exists!
            remarks : 'COMPRA DE BRINDE PARA OS CLIENTES',
            amount : '50.00'
        };

        var isValid = ExpenseService.isValid(expense);

        expect(storageStub.get).toHaveBeenCalledWith('entities',expense.entityId);
        expect(log.error).toHaveBeenCalledWith('ExpenseService.isValid: -Invalid entity, entity=' + expense.entityId);
        expect(isValid).toBe(false);
    });

});