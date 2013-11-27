describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var receivableId = 1;
    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update');
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            DataProvider : dp,
            ReceivableService : rs
        });
    }));

    /**
     * Given a pending receivable
     * when a cancel is triggered
     * then the the receivable must be cancelled
     */ 
    it('should cancel a receivable', function() {
        // given
        scope.receivable.id = receivableId;
        scope.receivable.canceled = false;
        
        var receivable = angular.copy(scope.receivable);
        
        // when
        var result = scope.cancel();
        receivable.canceled = true;
        
        // then
        expect(rs.update).toHaveBeenCalledWith(receivable);
        expect(result).toBe(true);
    });
    
   /** 
    * Given a fulfilled receivable
    * when a cancel is triggered
    * then the the receivable must not be cancelled
    * and a message should be logged: "unable to cancel an already fulfilled receivable"
    */
    it('shouldn\'t cancel a fulfilled receivable', function() {
        // given
        scope.receivable.id = receivableId;
        scope.receivable.received = {date: 1385380800000, amount: '100.0'};
        scope.receivable.canceled = false;
        
        // when
        var result = scope.cancel();
        
        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(scope.receivable.canceled).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Unable to cancel an already fulfilled receivable.');
        expect(result).toBe(false);
    });
    
});
