describe('Controller: ExpenseCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.expense');
    });

    var expenseId = 1;
    var scope = {};
    var log = {};
    var rs = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.expense = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // ExpenseService mock
        rs.save = jasmine.createSpy('ExpenseService.save').andReturn(expenseId);
        
        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log, 
            ExpenseService : rs
        });
    }));

    /**
     * Given a valid expense
     * when the user tries to save a expense
     * then a expense must be created
     * and the id must be returned
     */
    it('should save a expense', function() {
        // given
        scope.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
        scope.expense.stub = 'stubed value';
        
        var expense = angular.copy(scope.expense);
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.save).toHaveBeenCalledWith(expense);
        expect(id).toBe(expenseId);
    });
    
    /**
     * Given an invalid expense
     * when the user tries to save a expense
     * then we must log: invalid expense: {}
     */
    it('shouldn\'t save report a invalid expense', function() {
        // given
        jasmine.createSpy('ExpenseCtrl.isValid').andReturn(false);
        scope.expense.stub = 'stubed value';
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Invalid expense: ' + JSON.stringify(scope.expense));
        expect(id).toBeUndefined();
    });
});