describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update');
        
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {};
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            DataProvider: dp,
            ReceivableService : rs
        });
    }));
    
    /**
     * Given a pending receivable
     * and it is not cancelled
     * when a receive is triggered
     * then we must fulfill the receivable
     */
    it('should fulfill the receivable', function() {
        // given
        scope.receivable.canceled = false;
        
        // when
        scope.receive(1385380800000, '100.00');
        receivable.received = {date: 1385380800000, amount: '100.00'};
        
        // then
        expect(rs.update).toHaveBeenCalledWith(receivable);
    });
    
    /** 
     * Given a pending receivable
     * and it is cancelled
     * when a receive is triggered
     * then a message should be logged: "Unable to fulfill a cancelled receivable"
     */
    it('shouldn\'t fulfill a canceled receivable', function() {
        // given
        scope.receivable.canceled = true;
        
        // when
        scope.receive(1385380800000, '100.00');
        
        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Unable to fulfill a cancelled receivable.');
    });
    
    /** 
     * Given a fulfilled receivable
     * when a receive is triggered
     * then a message should be logged: "The receivable is already fulfilled"
     */
    it('shouldn\'t fulfill a already fulfilled receivable', function() {
        // given
        scope.receivable.canceled = false;
        scope.receivable.received = {receivedDate: 1385380800000, amount: '100.00'};
        
        // when
        scope.receive(1385380800000, '100.00');
        
        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -The receivable is already fulfilled');
    });
});