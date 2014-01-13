xdescribe('Service: ReceivableServiceUpdateSpec', function() {

    var log = {};
    var baseTime = 1386417600000;
    var oneDay = 24 * 60 * 60 * 1000;

    // load the service's module
    beforeEach(function() {
        var mock = {
            receivables : [
                {
                    id : 1,
                    duedate : baseTime
                }
            ]
        };
        log.error = jasmine.createSpy('$log.error');
        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', mock);
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ReceivableService_) {
        DataProvider = _DataProvider_;
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Given a validated receivable
     * And present on the database
     * when an update is triggered
     * then a receivable must be update in the database
     * and true must be returned
     * </pre>
     */
    it('should update a receivable', function() {
        // given
        var receivable = {
            id : 1,
            duedate : baseTime + oneDay
        };

        // when
        var result = ReceivableService.update(receivable);

        // then
        expect(receivable).toEqual(DataProvider.receivables[0]);
        expect(receivable).not.toBe(DataProvider.receivables[0]);
        expect(result).toBe(true);
    });

    /**
     * <pre>
     * Given a validated receivable
     * And not present on the database
     * when an update is triggered
     * then we must log: Could not find a receivable to update
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t update a receivable that is not present', function() {
        // given
        var receivable = {
            id : 2,
            duedate : baseTime + oneDay
        };

        // when
        var result = ReceivableService.update(receivable);

        // then
        expect(receivable).not.toEqual(DataProvider.receivables[0]);
        expect(log.error).toHaveBeenCalledWith(
                'ReceivableService.update: -Could not find a receivable to update with id=' + receivable.id);
        expect(result).toBe(false);
    });
});