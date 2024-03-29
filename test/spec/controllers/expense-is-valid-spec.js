xdescribe('Controller: ExpenseCtrl', function() {
    // load the controller's module
    beforeEach(module('tnt.catalog.financial.expense'));

    var scope = {};
    var log = {};
    var dp = {};
    var es = {};
    var fakeNow = 0;
    var monthTime = 2592000;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // DataProvider mock
        dp.entities = [
            {
                id : 1,
                name : 'O Lujinha'
            }
        ];

        // $scope mock
        scope = $rootScope.$new();
        scope.expense = {};

        fakeNow = 1386179100000;
        var dateFunc = function() {
            return fakeNow;
        };
        spyOn(MyApp.util, 'now').andCallFake(dateFunc);

        $controller('ExpenseCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            ExpenseService : es
        });
    }));

    /**
     * <pre>
     * Given a valid due date
     * and a valid amount
     * and a valid entity
     * when asked for validation
     * then true must be returned
     * </pre>
     */
    it('should report a valid expense', function() {
        // given
        scope.expense.duedate = fakeNow + monthTime;
        scope.expense.amount = '100.00';
        scope.expense.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given an invalid due date(in the past for instance)
     * when asked for validation
     * then false must be returned
     * and we must log: Invalid due date: {{now}} '-' {{due date}}
     * </pre>
     */
    it('should report a invalid due date of a expense', function() {
        // given
        scope.expense.duedate = fakeNow - monthTime;
        scope.expense.amount = '100.00';
        scope.expense.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith(
                'ExpenseCtrl: -Invalid due date: ' + fakeNow + ', dueDate:' + scope.expense.duedate + '}.');
    });

    /**
     * <pre>
     * Given a valid due date
     * and an amount equals to 0
     * when asked for validation
     * then false must be returned
     * and we must log: Invalid amount {{amount}}
     * </pre>
     */
    it('should report a 0 amount of a expense', function() {
        // given
        scope.expense.duedate = fakeNow + monthTime;
        scope.expense.amount = '0.00';
        scope.expense.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Invalid amount: ' + scope.expense.amount + '.');
        expect(result).toBe(false);
    });
    
    /**
     * <pre>
     * Given a valid due date
     * and an negative amount
     * when asked for validation
     * then false must be returned
     * and we must log: Invalid amount {{amount}}
     * </pre>
     */
    it('should report a negative amount of a expense', function() {
        // given
        scope.expense.duedate = fakeNow + monthTime;
        scope.expense.amount = '-66.12';
        scope.expense.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Invalid amount: ' + scope.expense.amount + '.');
        expect(result).toBe(false);
    });

    /**
     * <pre>
     * Given a valid due date
     * and a valid amount
     * and an invalid entity(how? it has been selected!)
     * when asked for validation
     * then false must be returned
     * and we must log: invalid entity: {{entity}}
     * </pre>
     */
    it('should report an invalid entity of a expense', function() {
        // given
        scope.expense.duedate = fakeNow + monthTime;
        scope.expense.amount = '100.00';
        scope.expense.entity = {
            id : 2,
            name : 'Não é o Lujinha'
        };

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ExpenseCtrl: -Invalid entity: ' + JSON.stringify(scope.expense.entity) + '.');
        expect(result).toBe(false);
    });
});
