xdescribe('Controller: ExpenseCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.expense');
    });

    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ExpenseService mock
        rs.update = jasmine.createSpy('ExpenseService.update');

        // $scope mock
        scope = $rootScope.$new();
        scope.expense = {};

        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            ExpenseService : rs
        });
    }));

    /**
     * <pre>
     * Given a pending expense
     * and it is not canceled
     * when a pay is triggered
     * then we must pay the expense
     * </pre>
     */
    it('should pay the expense', function() {
        // given
        scope.expense.canceled = false;

        // when
        scope.pay(1385380800000, '100.00');
        expense.payed = {
            date : 1385380800000,
            amount : '100.00'
        };

        // then
        expect(rs.update).toHaveBeenCalledWith(expense);
    });

    /**
     * <pre>
     * Given a pending expense
     * and it is canceled
     * when a pay is triggered
     * then a message should be logged: 'Unable to pay a canceled expense'
     * </pre>
     */
    it('shouldn\'t pay a canceled expense', function() {
        // given
        scope.expense.canceled = true;

        // when
        scope.pay(1385380800000, '100.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Unable to pay a canceled expense.');
    });

    /**
     * <pre>
     * Given a payed expense
     * when a pay is triggered
     * then a message should be logged: 'The expense is already payed'
     * </pre>
     */
    it('shouldn\'t pay a already payed expense', function() {
        // given
        scope.expense.canceled = false;
        scope.expense.payed = {
            date : 1385380800000,
            amount : '100.00'
        };

        // when
        scope.pay(1385380800000, '100.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -The expense is already payed');
    });
});
