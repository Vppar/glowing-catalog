describe('Controller: ExpenseCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.expense');
    });

    var expenseId = 1;
    var scope = {};
    var log = {};
    var dp = {};
    var es = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.expense = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ExpenseService mock
        es.update = jasmine.createSpy('ExpenseService.update');

        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            ExpenseService : es
        });
    }));

    /**
     * <pre>
     * Given a pending expense id
     * when a cancel is triggered
     * then the the expense must be canceled
     * </pre>
     */
    it('should cancel a expense', function() {
        // given
        scope.expense.id = expenseId;
        scope.expense.canceled = false;

        var expense = angular.copy(scope.expense);

        // when
        var result = scope.cancel();
        expense.canceled = true;

        // then
        expect(es.update).toHaveBeenCalledWith(expense);
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given a payed expense id
     * when a cancel is triggered
     * then the the expense must not be canceled
     * and a message should be logged: 'unable to cancel an already payed expense'
     * </pre>
     */
    it('shouldn\'t cancel a fulfilled expense', function() {
        // given
        scope.expense.id = expenseId;
        scope.expense.payed = {
            date : 1385380800000,
            amount : '100.0'
        };
        scope.expense.canceled = false;

        // when
        var result = scope.cancel();

        // then
        expect(es.update).not.toHaveBeenCalled();
        expect(scope.expense.canceled).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Unable to cancel an already payed expense.');
        expect(result).toBe(false);
    });

});
