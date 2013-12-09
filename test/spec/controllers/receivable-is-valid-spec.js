xdescribe('Controller: ReceivableCtrl', function() {
    // load the controller's module
    beforeEach(module('tnt.catalog.financial.receivable'));

    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};
    var fakeTime = 0;
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
        scope.receivable = {};

        fakeTime = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);

        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            ReceivableService : rs
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
    it('should report a valid receivable', function() {
        // given
        scope.receivable.duedate = fakeNow + monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = dp.entities[0];

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
    it('should report a invalid due date of a receivable', function() {
        // given
        scope.receivable.duedate = fakeNow - monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith(
                'ReceivableCtrl: -Invalid due date: ' + fakeNow + ', dueDate:' + scope.expense.duedate + '}.');
    });

    /**
     * <pre>
     * Given a valid due date
     * and an amount equals to 0 
     * when asked for validation
     * then false must be returned
     * and we must log: invalid amount {{amount}}
     * </pre>
     */
    it('should report a 0 amount of a receivable', function() {
        // given
        scope.receivable.duedate = fakeNow + monthTime;
        scope.receivable.amount = '0.00';
        scope.receivable.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount: ' + scope.receivable.amount + '.');
        expect(result).toBe(false);
    });

    /**
     * <pre>
     * Given a valid due date
     * and a negative amount
     * when asked for validation
     * then false must be returned
     * and we must log: invalid amount {{amount}}
     * </pre>
     */
    it('should report a negative amount of a receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.createdate + monthTime;
        scope.receivable.amount = '-66.12';
        scope.receivable.entity = dp.entities[0];

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount: ' + scope.receivable.amount + '.');
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
    it('should report an invalid entity of a receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.receivable.createdate + monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = {
            id : 2,
            name : 'Não é o Lujinha'
        };

        // when
        var result = scope.isValid();

        // then
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid entity: ' + JSON.stringify(scope.receivable.entity) + '.');
        expect(result).toBe(false);
    });
});
