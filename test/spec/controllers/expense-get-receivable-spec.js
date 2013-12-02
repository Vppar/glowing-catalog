describe('Controller: ExpenseCtrl', function() {

    var scope = {};
    var log = {};
    var dp = {};
    var es = {};
    var expense = {}; 

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.expense');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log, 
            DataProvider : dp,
            ExpenseService : es
        });
    }));
    
    /**
     * Given no parameters
     * when an getExpense is triggered
     * then the base expense object must be returned
     */
    it('should return a expense',function () {
        expense = {id: 1, createdate: 1385380800000, duedate: 1385380800000};
        scope.expense = expense;
        
        // when
        var returnedExpense = scope.getExpense();

        // then
        expect(returnedExpense).not.toBe(expense); 
        expect(returnedExpense).toEqual(expense);
    });
});