xdescribe('Service: ExpenseServiceListSpec', function() {

    var log = {};
    var storageStub = {};
    var filter = {};
    
    var expenses = [];
    var filteredExpenses = [];
    var timeFilteredExpenses = [];
    
    var filterImpl = {};
    var timeFrameImpl = {};
    
    var eStub1 = {};
    var eStub2 = {};
    var eStub3 = {};
    var eStub4 = {};

    // load the service's module
    beforeEach(function() {

        eStub1 = {
                id : 1,
                type : 'a',
                duedate: 1358534400000,
                stub :'I\'m the choosen stub 1'
        };
        eStub2 = {
            id : 2,
            type : 'a',
            duedate : 1368534400000,
            stub : 'I\'m a stub 2'
        };
        
        eStub3 = {
                id : 3,
                type : 'a',
                duedate : 1388534400000,
                stub : 'I\'m a stub 3'
        };
        
        eStub4 =  {
                id : 4,
                type : 'b',
                duedate : 1398534400000,
                stub : 'I\'m a stub 4'
        };
        
        filteredExpenses.push(eStub1, eStub2,eStub3);
        timeFilteredExpenses.push(eStub1, eStub2);
        expenses.push(eStub1, eStub2, eStub3, eStub4);
        
        storageStub.expenses = expenses;
        
       

        // storageService mock
        storageStub.list = jasmine.createSpy('StorageService.list').andReturn(expenses);
            
        // log mock
        log.error = jasmine.createSpy('$log.error');

        // filter mock
        filterImpl = jasmine.createSpy('filter').andCallFake(function(list,object) {
            return filteredExpenses;
        });
        timeFrameImpl = jasmine.createSpy('timeFrame').andCallFake(function(list,property,startDate,endDate) {
            return timeFilteredExpenses;
        });
        
        filter = jasmine.createSpy('$filter').andCallFake(function(name) {
            var selectedFilter = undefined;
            
            if (name === 'filter') {
                selectedFilter = filterImpl;
            }else
            if (name === 'timeFrame') {
                selectedFilter = timeFrameImpl;
            }
            
            return selectedFilter;
        });

        module('tnt.catalog.service.expense');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
            $provide.value('$filter', filter);
        });
    });

    beforeEach(inject(function(_ExpenseService_) {
        ExpenseService = _ExpenseService_;
    }));

    /**
     * <pre>
     * Given ?
     * when list is triggered
     * then the expenses list must be returned
     * </pre>
     */
    it('should return the list of expenses', function() {
        // given

        // when
        var list = ExpenseService.list();

        // then
        expect(storageStub.list).toHaveBeenCalledWith('expenses');
        expect(list).toBe(expenses);
    });

    /**
     * <pre>
     * Given a valid filter parameter
     * when list is triggered
     * then the expenses list filtered by the parameter must be returned
     * </pre>
     */
    it('should return a filtered list of expenses', function() {
        // given
        var filterValue = 'a';
        var firstDateValue = '1348534400000';
        var secondDateValue = '1368534400000';
        
        // when
        var list = ExpenseService.list(filter);

        // then
        expect(storageStub.list).toHaveBeenCalledWith('expenses');
        
        expect(filter).toHaveBeenCalledWith('filter');
        expect(filter).toHaveBeenCalledWith('timeFrame');
        
        expect(filterImpl).toHaveBeenCalledWith(storageStub.expenses, filterValue);
        expect(timeFrameImpl).toHaveBeenCalledWith(storageStub.expenses, 'duedate', firstDateValue,secondDateValue);
        
        expect(list).toBe(filteredExpenses);
    });

    /**
     * <pre>
     * Given an invalid filter parameter
     * when list is triggered
     * Then must be logged: 'ExepenseService.list: -Invalid filter parameter, filter={{filter}}'
     * and undefined must be returned
     * </pre>
     */
    it('shouldn\'t return the a list of expenses', function() {
        // given
        var filterValue = 'stuff';

        // when
        var list = ExpenseService.list(filterValue);

        // then
        expect(storageStub.list).not.toHaveBeenCalled();
        expect(filter).not.toHaveBeenCalled();
        expect(filterImpl).not.toHaveBeenCalled();
        expect(timeFrameImpl).not.toHaveBeenCalled();
        expect(list).toBeUndefined();
    });
});