xdescribe('Service: ReceivableServiceGetNextIdSpec', function() {

    // load the service's module
    beforeEach(function() {
        var dpStub = {
            receivables : []
        };
        module('tnt.catalog.service.receivable');
        module(function($provide) {
            $provide.value('DataProvider', dpStub);
        });
    });
    beforeEach(inject(function(_DataProvider_, _ReceivableService_) {
        DataProvider = _DataProvider_;
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Given an empty database
     * when a getNextId is triggered
     * then 1 must be returned
     * </pre>
     */
    it('should get an id=1', function() {
        // given

        // when
        var nextId = ReceivableService.getNextId();

        // then
        expect(nextId).toBe(1);
    });

    /**
     * <pre>
     * Given a populated database
     * when a getNextId is triggered
     * then the next id must be returned
     * </pre>
     */
    it('should get an id', function() {
        // given
        DataProvider.receivables.push({
            stub : 'I\'m stub',
            receivable : {
                id : 1
            }
        });

        // when
        var nextId = ReceivableService.getNextId();

        // then
        expect(nextId).toBe(2);
    });
});