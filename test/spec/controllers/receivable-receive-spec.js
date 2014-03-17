describe('Controller: ReceivableReceiveCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.receive.ctrl');
        module('tnt.catalog.service.book');
        module('tnt.catalog.bookkeeping.keeper');
    });

    var scope = {};
    var DataProvider = {};
    var ReceivableService = {};
    var DialogService = {};
    var receivables = null;
    var fakeNow = 1412421495;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $q) {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        // ReceivableService mock
        ReceivableService.receive = jasmine.createSpy('ReceivableService.receive').andCallFake(function(){
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });
        
        ReceivableService.listActive = jasmine.createSpy('ReceivableService.listActive').andReturn(receivables);

        // $scope mock
        scope = $rootScope.$new();
        // mock function of parent controller.
        scope.selectReceivableMode = jasmine.createSpy('scope.selectReceivableMode');
        scope.clearSelectedReceivable = jasmine.createSpy('scope.clearSelectedReceivable');
        $controller('ReceivableReceiveCtrl', {
            $scope : scope,
            DataProvider : DataProvider,
            DialogService : DialogService,
            ReceivableService : ReceivableService
        });
    }));

    beforeEach(function() {
        receivables = [];

        // An old and expired receivable
        receivables.push({
            uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
            // created one month ago
            created : new Date().getTime(),
            entityId : 1,
            type : "check",
            amount : 123,
            // expired one week ago
            duedate : new Date().getTime()
        });
        receivables.push({
            uuid : "cc02b600-5d0b-11e3-96c3-010001000019",
            // created one month ago
            created : new Date().getTime(),
            entityId : 1,
            type : "check",
            amount : 0,
            // expired one week ago
            duedate : new Date().getTime()
        });
    });

    it('should isValid return true', function() {
        // given

        // when
        var result = scope.isValid(receivables[0]);

        // then
        expect(result).toEqual(true);

    });

    it('should isValid return false', function() {
        // given

        // when
        var result = scope.isValid(receivables[1]);

        // then
        expect(result).toEqual(false);

    });
});
