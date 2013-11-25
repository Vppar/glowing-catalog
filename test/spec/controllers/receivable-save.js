describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(module('tnt.catalog.financial.receivable'));

    var scope = {};
    var log = {};
    var dp = {};
    

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
     * Given a valid receivable
     * when the user tries to create a receivable
     * then a receivable must be created
     * and the id must be returned
     */
    it('should save a receivable', function() {
        // given
        scope.createdate = new Date();
        scope.duedate = scope.createdate + monthTime;
        scope.amount = '100.00';
        scope.entity = dp.entities[0].id;
        
        // when
        
        // then
    });
    
    /**
     * Given an invalid receivable
     * when the user tries to create a receivable
     * then we must log: invalid receivable: {}
     */
    it('shouldn\'t save report a invalid receivable', function() {
        // given
        
        // when
        
        // then
    });
    
});