describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var receivableId = 1;
    var scope = {};
    var log = {};
    var rs = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update');
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            ReceivableService : rs
        });
    }));

    /**
     * Given a pending receivable
     * when a cancel is triggered
     * then the the receivable must be cancelled
     */ 
    it('should save a receivable', function() {
        // given
        scope.id = receivableId;
        scope.received = false;
        rs.update = rs.update.andReturn(true);
        
        // when
        var result = scope.cancel();
        
        // then
        expect(rs.update).toHaveBeenCalledWith(scope);
        expect(result).toBe(true);
    });
    
   /** 
    * Given a fulfilled receivable
    * when a cancel is triggered
    * then the the receivable must not be cancelled
    * and a message should be logged: "unable to cancel an already fulfilled receivable"
    */
    it('shouldn\'t save report a invalid receivable', function() {
        // given
        scope.id = receivableId;
        scope.received = true;
        rs.update = rs.update.andReturn(false);
        
        // when
        var result = scope.cancel();
        
        // then
        expect(rs.update).toHaveBeenCalledWith(scope);
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Unable to cancel an already fulfilled receivable');
    });
    
});