describe('Service: ExpenseServiceAddSpec', function() {

    var log = {};
    var storageStub = {};
    var eStub = {};

    // load the service's module
    beforeEach(function() {

        eStub = {
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

        // log mock
        log.error = jasmine.createSpy('$log.error');

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
     * Given a valid expense object
     * When add is triggered
     * Then a new expense must be added to the storage
     * and the id of the expense added must be returned
     * </pre>
     */
    it('should add a new expense into to the storage', function() {
        // given
        var expense = {
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
            
        // when
        var result = ExpenseService.add(expense);

        // then
        expect(storageStub.isValid).toHaveBeenCalledWith(expense);
        expect(storageStub.insert).toHaveBeenCalledWith('expenses',expense);
        expect(result).toEqual(expense.id);

    });

    /**
     * <pre>
     * Given an invalid expense object
     * Then must be logged: 'ExpenseService.add: -Invalid expense object'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t add a new expense into the storage', function() {
        // given
        var nonxpense = {
                amount : '250.00'
        };

        // when
        var result = ExpenseService.add(nonxpense);

        // then
        expect(storageStub.isValid).toHaveBeenCalledWith(expense);
        expect(storageStub.insert).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExpenseService.add: -Invalid expense object');
        expect(result).toEqual(false);
    });

});