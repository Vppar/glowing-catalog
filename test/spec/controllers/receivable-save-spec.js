xdescribe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var receivableId = 1;
    var scope = {};
    var log = {};
    var rs = {};
    var dp = {};
    var ds = {};

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $scope mock
        scope = $rootScope.$new();
        scope.receivable = {};

        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        rs.create = jasmine.createSpy('ReceivableService.create').andReturn(receivableId);
        rs.update = jasmine.createSpy('ReceivableService.update').andReturn(true);

        $controller('ReceivableCtrl', {
            $scope : scope,
            $log : log,
            DataProvider : dp,
            DialogService : ds,
            ReceivableService : rs
        });
    }));

    /**
     * <pre>
     * Givenavalid receivable and it hasn't an id
     * when the user tries to save a receivable
     * then a receivable must be created
     * and the id must be filled
     * </pre>
     */
    it('should save a receivable', function() {
        // given
        scope.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(true);
        scope.receivable.stub = 'stubed value';

        // when
        var id = scope.save();

        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.create).toHaveBeenCalledWith(scope.receivable);
        expect(id).toBe(true);
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
        var result = scope.save();

        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(rs.update).toHaveBeenCalledWith(receivable);
        expect(result).toBe(true);
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
        scope.isValid = jasmine.createSpy('ReceivableCtrl.isValid').andReturn(false);
        scope.receivable.stub = 'stubed value';

        // when
        var result = scope.save();

        // then
        expect(scope.isValid).toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid receivable: ' + JSON.stringify(scope.receivable));
        expect(result).toBe(false);
    });

});
