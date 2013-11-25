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
        rs.save = jasmine.createSpy('ReceivableService.save').andReturn(receivableId);
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            ReceivableService : rs
        });
    }));

    /**
     * Given a valid receivable
     * when the user tries to save a receivable
     * then a receivable must be created
     * and the id must be returned
     */
    it('should save a receivable', function() {
        // given
        scope.isValid = function(){return true;};
        
        // when
        var id = scope.save();
        
        // then
        expect(rs.save).toHaveBeenCalledWith(scope);
        expect(id).toBe(receivableId);
    });
    
    /**
     * Given an invalid receivable
     * when the user tries to save a receivable
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t save report a invalid receivable', function() {
        // given
        scope.isValid = function(){return false;};
        
        // when
        var id = scope.save();
        
        // then
        expect(id).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid receivable: ' + JSON.stringify(scope.receivable));
    });
    
});