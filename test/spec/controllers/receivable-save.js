describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
        module('tnt.catalog.filter.findBy');
    });

    var scope = {};
    var log = {};
    var dp = {};
    

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        // DataProvider mock
        dp.entities = [{ id: 1, name: 'O Lujinha'}];
        dp.receivables = angular.copy(sampleData.receivables);
        
        // $scope mock
        scope = $rootScope.$new();
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp
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
        var receivable = sampleData.validReceivable;
        angular.extend(scope.receivable, receivable);
        
        // when
        var id = scope.save();
        
        // then
        expect(id).toBeGreaterThan(0);
        
        var savedReceivable = $filter('findBy')(dp.receivables, 'id', id);
        expect(receivable).toEqual(savedReceivable);
    });
    
    /**
     * Given an invalid receivable
     * when the user tries to save a receivable
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t save report a invalid receivable', function() {
        // given
        var receivable = sampleData.invalidReceivable;
        angular.extend(scope.receivable, receivable);
        
        // when
        var id = scope.save();
        
        // then
        expect(id).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid receivable: ' + JSON.stringify(scope.receivable));
    });
    
});