xdescribe('Service: ReceivableServiceListSpec', function() {

    var log = {};
    var baseTime = 1386417600000;
    var oneDay = 24 * 60 * 60 * 1000;

    // load the service's module
    beforeEach(function() {
        var dpStub = {
            receivables : [
                {
                    id : 1,
                    duedate : baseTime + oneDay
                }, {
                    id : 2,
                    duedate : baseTime - oneDay
                }, {
                    id : 3,
                    duedate : baseTime + 3 * oneDay
                }
            ]
        };

        log.error = jasmine.createSpy('$log.error');

        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ReceivableService_) {
        DataProvider = _DataProvider_;
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Given an ordered by id receivable list
     * when list is triggered
     * then a copy of the entire list must be returned
     * </pre>
     */
    it('should return full list copy', function() {
        // given

        // when
        var receivables = ReceivableService.list();

        // then
        expect(receivables).toEqual(DataProvider.receivables);
        expect(receivables).not.toBe(DataProvider.receivables);
    });

    /**
     * <pre>
     * Given an ordered by id receivable list
     * and a start date before max(due date) of the list
     * and a end date after the start date
     * when list is triggered
     * then a list of all receivables that have a due date between start and end date must be returned
     * and it must be a copy
     * </pre>
     */
    it('should return a timeframe copy list ', function() {
        // given
        var startDate = baseTime;
        var endDate = baseTime + 2 * oneDay;

        // when
        var filteredReceivables = ReceivableService.list({
            startDate : startDate,
            endDate : endDate
        });

        // then
        expect(log.error).not.toHaveBeenCalled();
        expect(filteredReceivables[0]).toEqual(DataProvider.receivables[0]);
        expect(filteredReceivables[0]).not.toBe(DataProvider.receivables[0]);
    });

    /**
     * <pre>
     * Given an ordered by id receivable list
     * and a start date before max(due date) of the list
     * and no end date
     * when list is triggered
     * then a list of all receivables that have a due date after start date must be returned
     * and it must be a copy
     * </pre>
     */
    it('should return a partial list from startDate until the end of the list', function() {
        var startDate = baseTime;

        // when
        var filteredReceivables = ReceivableService.list({
            startDate : startDate
        });

        // then
        expect(log.error).not.toHaveBeenCalled();
        expect(filteredReceivables.length).toBe(2);
        expect(filteredReceivables[0]).toEqual(DataProvider.receivables[0]);
        expect(filteredReceivables[1]).toEqual(DataProvider.receivables[2]);
        expect(filteredReceivables[0]).not.toBe(DataProvider.receivables[0]);
        expect(filteredReceivables[1]).not.toBe(DataProvider.receivables[2]);
    });

    /**
     * <pre>
     * Given an ordered by id receivable list
     * and a start date after max(due date) of the list
     * and a end date after the start date
     * when list is triggered
     * then undefined must be returned
     * and must be logged : 'No receivable found for the timeframe: {{startDate}} - {{endDate}}'
     * </pre>
     */
    it('shouldn\'t find a receivable', function() {
        // given
        var startDate = baseTime + 4 * oneDay;
        var endDate = baseTime + 5 * oneDay;

        // when
        var filteredReceivables = ReceivableService.list({
            startDate : startDate,
            endDate : endDate
        });

        // then
        expect(filteredReceivables).toBeUndefined();
        expect(log.error)
                .toHaveBeenCalledWith('ReceivableService.list: -No receivable found for the timeframe: ' + startDate + ' - ' + endDate);
    });

    /**
     * <pre>
     * Given an ordered by id receivable list
     * and a start date
     * and a end date before the start date
     * when list is triggered
     * then undefined must be returned
     * and must be logged : 'Invalid timeframe parameters: {{startDate}} - {{endDate}}'
     * </pre>
     */
    it('should log error', function() {
        // given
        var startDate = baseTime;
        var endDate = baseTime - oneDay;

        // when
        var filteredReceivables = ReceivableService.list({
            startDate : startDate,
            endDate : endDate
        });

        // then
        expect(filteredReceivables).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith('ReceivableService.list: Invalid timeframe parameters: ' + startDate + ' - ' + endDate);
    });
});