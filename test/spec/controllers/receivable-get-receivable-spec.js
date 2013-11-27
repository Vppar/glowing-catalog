describe('Controller: ReceivableCtrl', function() {

    var scope = {};
    var log = {};
    var dp = {};
    var rs = {};
    var receivable = {}; 

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();

        // $log mock
        log.error = jasmine.createSpy('$log.error');
        
        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log, 
            DataProvider : dp,
            ReceivableService : rs
        });
    }));
    
    /**
     * Given no parameters
     * when an getReceivable is triggered
     * then the base receivable object must be returned
     */
    it('should return a receivable',function () {
        receivable = {id: 1, createdate: 1385380800000, duedate: 1385380800000};
        scope.receivable = receivable;
        
        // when
        var returnedReceivable = scope.getReceivable();

        // then
        expect(returnedReceivable).not.toBe(receivable); 
        expect(returnedReceivable).toEqual(receivable);
    });
});