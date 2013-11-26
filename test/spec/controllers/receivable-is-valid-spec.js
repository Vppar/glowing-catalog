describe('Controller: ReceivableCtrl', function() {
    // load the controller's module
    beforeEach(module('tnt.catalog.financial.receivable'));

    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};
    var monthTime = 2592000;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // DataProvider mock
        dp.entities = [{ id: 1, name: 'O Lujinha'}];
        
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {};
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            ReceivableService : rs
        });
    }));

    /**
     * Given a valid due date
     * and a valid amount
     * and a valid entity
     * and a valid creation date
     * when asked for validation
     * then true must be returned
     */
    it('should report a valid receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.receivable.createdate + monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(true);
    });

    /**
     * Given an invalid due date(in the past for instance)
     * when asked for validation
     * then false must be returned
     * and we must log: Invalid due date {{due date, current date}}
     */
    it('should report a invalid due date of a receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.receivable.createdate - monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith(
                'ReceivableCtrl: -Invalid due date: {createDate:' + scope.receivable.createdate + ', dueDate:' + scope.receivable.duedate +
                    '}.');
    });

    /**
     * Given a valid due date
     * and an amount equals 0
     * when asked for validation then false must be returned and we must log: invalid amount {{amount}}
     */
    it('should report a 0 amount of a receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.receivable.createdate + monthTime;
        scope.receivable.amount = '0.00';
        scope.receivable.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount: ' + scope.receivable.amount + '.');
        expect(result).toBe(false);
    });
    
    /**
     * Given a valid due date
     * and an negative amount
     * when asked for validation 
     * then false must be returned and we must log: invalid amount {{amount}}
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
     * Given a valid due date 
     * and a valid amount
     * and an invalid entity(how? it has been selected!)
     * when asked for validation 
     * then false must be returned
     * and we must log: invalid entity: {{entity}}
     */
    it('should report a invalid entity of a receivable', function() {
        // given
        scope.receivable.createdate = new Date();
        scope.receivable.duedate = scope.receivable.createdate + monthTime;
        scope.receivable.amount = '100.00';
        scope.receivable.entity = {id: 2, name: 'Não é o Lujinha'};
        
        // when
        var result = scope.isValid();
        
        // then
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid entity: ' + JSON.stringify(scope.receivable.entity) + '.');
        expect(result).toBe(false);
    });
});