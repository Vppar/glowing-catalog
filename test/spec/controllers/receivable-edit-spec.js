describe('Controller: ReceivableEditCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable.edit.ctrl');
    });

    var scope = {};
    var DataProvider = {};
    var ReceivableService = {};
    var DialogService = {};
    var receivables = null;
    var fakeNow = 1412421495;
    var result = false;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $q) {
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        // ReceivableService mock
        ReceivableService.update = jasmine.createSpy('ReceivableService.update');
        ReceivableService.listActive = jasmine.createSpy('ReceivableService.listActive').andReturn(receivables);

        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            result = true;
            return defer.promise;
        });
        
        // $scope mock
        scope = $rootScope.$new();
        
        // mock function of parent controller.
        scope.selectReceivableMode = jasmine.createSpy('scope.selectReceivableMode');
        scope.clearSelectedReceivable = jasmine.createSpy('scope.clearSelectedReceivable');
        
        $controller('ReceivableEditCtrl', {
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

    it('should valid receivable', function() {
        // given

        // when
        var result = scope.isValid(receivables[0]);

        // then
        expect(result).toEqual(true);

    });

    it('should invalid receivable', function() {
        // given

        // when
        var result = scope.isValid(receivables[1]);

        // then
        expect(result).toEqual(false);

    });

    it('should update a receivable', function() {
        runs(function() {
            scope.removeArguments = jasmine.createSpy('scope.removeArguments').andReturn(receivables[0]);
            // given
            scope.selectedReceivable = receivables[0];
            // when
            scope.comfirmUpdate();
        });

        waitsFor(function() {
            scope.$apply();
            return !!result;
        });

        runs(function() {
            // then
            expect(DialogService.messageDialog).toHaveBeenCalled();
            expect(ReceivableService.update).toHaveBeenCalledWith(receivables[0].uuid,receivables[0].remarks, receivables[0].duedate);
        });
    });

    it('should not update a receivable', function() {
        runs(function() {
            scope.removeArguments = jasmine.createSpy('scope.removeArguments').andReturn(receivables[1]);
            // given
            scope.selectedReceivable = receivables[1];
            // when
            scope.comfirmUpdate();
        });

        waitsFor(function() {
            scope.$apply();
            return !!result;
        });

        runs(function() {
            // then
            expect(ReceivableService.update).not.toHaveBeenCalled();
            expect(DialogService.messageDialog).toHaveBeenCalled();
            expect(scope.clearSelectedReceivable).toHaveBeenCalled();
        });
    });

});
