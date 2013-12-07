xdescribe('Controller: ReceivableCtrl', function() {

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
        scope.receivable = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // ReceivableService mock
        rs.save = jasmine.createSpy('ReceivableService.save').andReturn(receivableId);
        rs.update = jasmine.createSpy('ReceivableService.update');
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            ReceivableService : rs
        });
    }));

    /**
     * <pre>
     * Given a valid receivable
     * and it hasn't an id
     * when the user tries to save a receivable
     * then a receivable must be created
     * and the id must be filled
     * </pre>
     */
    it('should save a receivable', function() {
        // given
        scope.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        scope.receivable.stub = 'stubed value';
        
        var receivable = angular.copy(scope.receivable);
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.save).toHaveBeenCalledWith(receivable);
        expect(id).toBe(receivableId);
    });
    
    /**
     * <pre>
     * Given a valid receivable
     * and it is present in the database
     * when the user tries to save a receivable
     * then a receivable must be updated
     * </pre>
     */
    it('should save a receivable', function() {
        // given
        scope.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        scope.receivable.id = 15;
        
        var receivable = angular.copy(scope.receivable);
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(receivable);
        expect(id).toBe(receivableId);
    });
    
    /**
     * <pre>
     * Given an invalid receivable
     * when the user tries to save a receivable
     * then we must log: invalid receivable: {}
     * </pre>
     */
    it('shouldn\'t save report a invalid receivable', function() {
        // given
        jasmine.createSpy('ReceivableCtrl.isValid').andReturn(false);
        scope.receivable.stub = 'stubed value';
        
        // when
        var id = scope.save();
        
        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid receivable: ' + JSON.stringify(scope.receivable));
        expect(id).toBeUndefined();
    });
    
});
