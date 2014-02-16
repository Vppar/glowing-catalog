xdescribe('Service: ExpenseServiceUpdateSpec', function() {

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
        
        // storageService mock
            storageStub.get = jasmine.createSpy('StorageService.get').andCallFake(function(name,id) {
                if (id === 1) {
                    return eStub;
                }
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
     * Given a valid expense object 
     * and the expense's id exists 
     * When update is triggered 
     * Then the expense with this id must be updated in the storage
     * and true must be returned
     * </pre>
     */
    it('should update a expense', function() {
        //given
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
                remarks : 'FEITA A COMPRA DE BRINDE PARA OS CLIENTES',
                amount : '250.00'
            };
        
        //when
        var result = ExpenseService.update(expense);
        
        //then
        expect(storageStub.isValid).toHaveBeenCalledWith(expense);
        expect(storageStub.get).toHaveBeenCalledWith('expenses',expense.id);
        expect(storageStub.update).toHaveBeenCalledWith('expenses',expense);
        expect(result).toEqual(true);
        
        
    });

    /**
     * <pre>
     * Given a valid expense object 
     * and the expense's id doesn't exists 
     * When update is triggered 
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t update a expense', function() {
        var expense = {
                id : 14,
                createdate : 1357948800000,
                duedate : 1388534400000,
                document : {
                    number : 979,
                    type : 'NOTA FISCAL'
                },
                type : 'BRINDE',
                entityId : 17,
                remarks : 'FEITA A COMPRA DE BRINDE PARA OS CLIENTES',
                amount : '250.00'
            };
        
        //when
        var result = ExpenseService.update(expense);
        
        expect(storageStub.isValid).toHaveBeenCalledWith(expense);
        expect(storageStub.get).toHaveBeenCalledWith('expenses',expense.id);
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(result).toEqual(false);
    });

    /**
     * <pre>
     * Given an invalid expense object 
     * When update is triggered 
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t update a expense', function() {
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
                remarks : 'FEITA A COMPRA DE BRINDE PARA OS CLIENTES'
            };
        
        //when
        var result = ExpenseService.update(expense);
        
        expect(storageStub.isValid).toHaveBeenCalledWith(expense);
        expect(storageStub.get).not.toHaveBeenCalled();
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(result).toEqual(false);
    });

    /*
     * var expenseCtrl = {}; var log = {}; // load the service's module
     * beforeEach(function() { expenseCtrl = {stub: 'I\'m stub 2', expense:{id:
     * 2}}; var dpStub = { expenses : [{stub: 'I\'m stub', expense:{id: 1}}] };
     * 
     * log.error = jasmine.createSpy('$log.error');
     * 
     * module('tnt.catalog.service.expense'); module(function($provide) {
     * $provide.value('DataProvider', dpStub); $provide.value('$log', log); });
     * }); beforeEach(inject(function(_DataProvider_, _ExpenseService_) {
     * DataProvider = _DataProvider_; ExpenseService = _ExpenseService_; }));
     */

    /**
     * Given a valid expense And present on the database when an update is
     * triggered then a expense must be update in the database
     */
    /*
     * it('should update a expense', function() { // given expenseCtrl.isValid =
     * jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
     * DataProvider.expenses.push(angular.copy(expenseCtrl)); // when
     * expenseCtrl.stub = 'I\'m a new stub 2';
     * ExpenseService.update(expenseCtrl);
     * 
     * var lastExpense = DataProvider.expenses.pop(); // then
     * expect(expenseCtrl.isValid).toHaveBeenCalled();
     * expect(lastExpense).toEqual(expenseCtrl); });
     */
    /**
     * Given a valid expense And not present on the database when an update is
     * triggered then we must log: Could not find expense to update
     */
    /*
     * it('shouldn\'t update a expense that is not present', function() { //
     * given expenseCtrl.isValid =
     * jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true); // when
     * expenseCtrl.stub = 'I\'m a new stub 2';
     * ExpenseService.update(expenseCtrl);
     * 
     * var lastExpense = DataProvider.expenses.pop(); // then
     * expect(expenseCtrl.isValid).toHaveBeenCalled();
     * expect(lastExpense).not.toEqual(expenseCtrl);
     * expect(log.error).toHaveBeenCalledWith('Could not find expense to
     * update'); });
     */
    /**
     * Given an invalid expense when an update is triggered then we must log:
     * invalid expense: {}
     */
    /*
     * it('shouldn\'t update an invalid expense', function() { // given
     * expenseCtrl.isValid =
     * jasmine.createSpy('ExpenseCtrl.isValid').andReturn(false); // when
     * expenseCtrl.stub = 'I\'m a new stub 2';
     * ExpenseService.update(expenseCtrl);
     * 
     * var lastExpense = DataProvider.expenses.pop(); // then
     * expect(expenseCtrl.isValid).toHaveBeenCalled();
     * expect(lastExpense).not.toEqual(expenseCtrl);
     * expect(log.error).toHaveBeenCalledWith('ExpenseService: -Invalid
     * expense:' + JSON.stringify(expenseCtrl)); });
     */
});