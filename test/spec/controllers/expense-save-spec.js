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
        rs.create = jasmine.createSpy('ExpenseService.create').andReturn(expenseId);
        rs.update = jasmine.createSpy('ExpenseService.update');
        
        $controller('ExpenseCtrl', {
            $scope : scope, 
            $log : log, 
            ExpenseService : rs
        });
    }));

    /**
     * <pre>
     * Given a valid expense
     * and it hasn't an id
     * when the user tries to save an expense
     * then a expense must be created
     * and the id must be filled
     * </pre>
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
        expect(rs.create).toHaveBeenCalledWith(expense);
        expect(id).toBe(expenseId);
    });
    
    /**
     * <pre>
     * Given a valid expense
     * and it has an id
     * when the user tries to save a expense
     * then a expense must be updated
     * </pre>
     */
    it('should save a expense', function() {
        // given
        scope.isValid = jasmine.createSpy('ExpenseCtrl.isValid').andReturn(true);
        scope.expense.id = 15;
        
        var expense = angular.copy(scope.expense);
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(expense);
        expect(id).toBe(expenseId);
    });
    
    /**
     * <pre>
     * Given an invalid expense
     * when the user tries to save a expense
     * then we must log: invalid expense: {}
     * </pre>
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