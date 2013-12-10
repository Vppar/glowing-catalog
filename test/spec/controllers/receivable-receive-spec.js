describe('Controller: ReceivableCtrl', function() {

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.financial.receivable');
    });

    var scope = {};
    var log = {};
    var dp = {};
    var ds = {};
    var rs = {};
    var fakeNow = 0;
    var oneHour = 60 * 60 * 1000;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        // $log mock
        log.error = jasmine.createSpy('$log.error');

        // ReceivableService mock
        rs.update = jasmine.createSpy('ReceivableService.update');

        // $scope mock
        scope = $rootScope.$new();
        fakeNow = 1385380800000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

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
     * Given a pending receivable
     * and it is not canceled
     * when a receive is triggered
     * then we must fulfill the receivable
     * </pre>
     */
    it('should fulfill the receivable', function() {
        // given
        scope.receivable.canceled = false;

        // when
        scope.receive(fakeNow - oneHour, '100.00');

        // then
        expect(rs.update).toHaveBeenCalledWith(scope.receivable);
    });

    /**
     * <pre>
     * Given a pending receivable
     * and it is cancelled
     * when a receive is triggered
     * then a message should be logged: 'Unable to fulfill a canceled receivable'
     * </pre>
     */
    it('shouldn\'t fulfill a canceled receivable', function() {
        // given
        scope.receivable.canceled = true;

        // when
        scope.receive(fakeNow - oneHour, '100.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Unable to fulfill a canceled receivable.');
    });

    /**
     * <pre>
     * Given a fulfilled receivable
     * when a receive is triggered
     * then a message should be logged: 'The receivable is already fulfilled'
     * </pre>
     */
    it('shouldn\'t fulfill a already fulfilled receivable', function() {
        // given
        scope.receivable.canceled = false;
        scope.receivable.received = {
            date : fakeNow - oneHour,
            amount : '100.00'
        };

        // when
        scope.receive(1385380800000, '100.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -The receivable is already fulfilled');
    });

    /**
     * <pre>
     * Given a pending receivable
     * and a invalid receipt date.
     * when a receive is triggered
     * then a message should be logged: 'Unable to fulfill a canceled receivable'
     * </pre>
     */
    it('shouldn\'t fulfill a receivable with invalid receipt date', function() {
        // given
        scope.receivable.canceled = false;

        // when
        scope.receive(fakeNow + oneHour, '100.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid receipt date.');
    });

    /**
     * <pre>
     * Given a pending receivable
     * and a invalid amount.
     * when a receive is triggered
     * then a message should be logged: 'Unable to fulfill a canceled receivable'
     * </pre>
     */
    it('shouldn\'t fulfill a receivable with invalid receipt date', function() {
        // given
        scope.receivable.canceled = false;

        // when
        scope.receive(fakeNow - oneHour, '-5.00');

        // then
        expect(rs.update).not.toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('ReceivableCtrl: -Invalid amount.');
    });
});
