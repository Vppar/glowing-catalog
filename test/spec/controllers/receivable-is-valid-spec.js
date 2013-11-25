describe('Controller: ReceivableCtrl', function() {
    // load the controller's module
    beforeEach(module('tnt.catalog.financial.receivable'));

    var scope = {};
    var log = {};
    var dp = {};
    var monthTime = 2592000;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // DataProvider mock
        dp.entities = [{ id: 1, name: 'O Lujinha'}];
        
        // $scope mock
        scope = $rootScope.$new();
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp
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
        scope.createdate = new Date();
        scope.duedate = scope.createdate + monthTime;
        scope.amount = '100.00';
        scope.entity = dp.entities[0];
        
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
        scope.createdate = new Date();
        scope.duedate = scope.createdate - monthTime;
        scope.amount = '100.00';
        scope.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid due date: '+scope.createdate+', '+scope.duedate );
    });

    /**
     * Given a valid due date
     * and an amount equals 0
     * when asked for validation then false must be returned and we must log: invalid amount {{amount}}
     */
    it('should report a 0 amount of a receivable', function() {
        // given
        scope.createdate = new Date();
        scope.duedate = scope.createdate + monthTime;
        scope.amount = '0.00';
        scope.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount: ' + scope.amount);
    });
    
    /**
     * Given a valid due date
     * and an negative amount
     * when asked for validation 
     * then false must be returned and we must log: invalid amount {{amount}}
     */
    it('should report a negative amount of a receivable', function() {
        // given
        scope.createdate = new Date();
        scope.duedate = scope.createdate + monthTime;
        scope.amount = '-66.12';
        scope.entity = dp.entities[0];
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount: ' + scope.amount);
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
        scope.createdate = new Date();
        scope.duedate = scope.createdate + monthTime;
        scope.amount = '100.00';
        scope.entity = {id: 2, name: 'Não é o Lujinha'};
        
        // when
        var result = scope.isValid();
        
        // then
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid entity: '+ scope.entity.name);
    });
});