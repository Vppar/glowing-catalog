xdescribe('Service: ExpenseServiceCancelSpec', function() {

    var log = {};
    var storageStub = {};
    var eStub1 = {};
    var eStub2 = {};

    // load the service's module
    beforeEach(function() {

        eStub1 = {
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
            amount : '250.00',
            active : true
        };
        eStub2 = {
                id : 2,
                createdate : 1357948800000,
                duedate : 1388534400000,
                document : {
                    number : 979,
                    type : 'NOTA FISCAL'
                },
                type : 'BRINDE',
                entityId : 17,
                remarks : 'COMPRA DE BRINDE PARA OS CLIENTES',
                amount : '250.00',
                active : false
            };

        // log mock
        log.error = jasmine.createSpy('$log.error');
        
        //storage mock
        storageStub.get = jasmine.createSpy('StorageService.get').andCallFake(function(name,id) {
            var result = undefined;
            if(name === 'expenses'){
                if(id === 1){
                    result = eStub1;
                }else
                if(id === 2){
                    result = eStub2;
                }
            }
            return result;
        });
        
        storageStub.update = jasmine.createSpy('StorageService.update').andReturn(true);

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
     * When cancel is triggered
     * Then must be logged: 'ExepenseService.cancel: -Expense cancelled, id={{id}}'
     * the expense with that id must be set to cancelled
     * and true must be returned
     * </pre>
     */
    it('should cancel an expense', function() {
        //given
        var id = 1;
        
        //when
        var result = ExpenseService.cancel(id);
        
        //then
        expect(log.error).toHaveBeenCalledWith('ExepenseService.cancel: -Expense cancelled, id=' + id);
        expect(storageStub.get).toHaveBeenCalledWith('expenses',id);
        expect(storageStub.update).toHaveBeenCalledWith('expenses',id);
        expect(eStub1.active).toEqual(false);
        expect(result).toEqual(true);
        
    });

    /**
     * <pre>
     * Given an non-existing id
     * When cancel is triggered
     * Then false must be returned
     * </pre>
     */
    it('shouldn\'t cancel an expense', function() {
        //given
        var id = 5;
        
        //when
        var result = ExpenseService.cancel(id);
        
        //then
        expect(storageStub.get).toHaveBeenCalledWith('expenses',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(eStub1.active).toEqual(true);
        expect(eStub2.active).toEqual(false);
        expect(result).toEqual(false);
    });

    /**
     * <pre>
     * Given an existing id
     * and the expense is already cancelled
     * When cancel is triggered
     * Then must be logged: 'ExepenseService.cancel: -Expense was already cancelled, id={{id}}'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t cancel an existent expense', function() {
        //given
        var id = 2;
        
        //when
        var result = ExpenseService.cancel(id);
        
        //then
        expect(storageStub.get).toHaveBeenCalledWith('expenses',id);
        expect(storageStub.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExepenseService.cancel: -Expense was already cancelled, id=' + id);
        expect(eStub1.active).toEqual(true);
        expect(eStub2.active).toEqual(false);
        expect(result).toEqual(false);
    });

});