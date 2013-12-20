xdescribe('Service: ExpenseServiceGetSpec', function() {

    var log = {};
    var storageStub = {};
    var eStub = {};

    // load the service's module
    beforeEach(function() {

        eStub = {
                id : 1,
                stub : 'I\'m a stub'
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
     * Given an existing id
     * when get is triggered
     * then the expense with that id must be returned
     * </pre>
     */
    it('should return the expense that is associated with the id', function() {
       //given
       var id = 1;
        
       //when
       var expense = ExpenseService.get(id);
       
       //then
       expect(storageStub.get).toHaveBeenCalledWith('expenses',id);
       expect(expense).toEqual(eStub);
        
        
    });

    /**
     * <pre>
     * Given an non-existing id
     * When get is triggered
     * Then must be logged: 'ExepenseService.get: -Expense not found, id={{id}}'
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return an expense', function() {
        // given
        var id = 5;
     
        // when
        var expense = ExpenseService.get(id);
        
        // then
        expect(storageStub.get).toHaveBeenCalledWith('expenses',id);
        expect(log.error).toHaveBeenCalledWith('ExepenseService.get: -Expense not found, id=' + id);
        expect(product).toBeUndefined();
    });

});