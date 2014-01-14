xdescribe('Service: ReceivableServiceReadSpec', function() {

    var receivable = {};
    var receivableId = 1;
    var log = {};

    // load the service's module
    beforeEach(function() {
        var dpStub = {
            receivables : [
                {
                    id : 1
                }
            ]
        };

        receivable = {
            stub : 'I\'m a stub'
        };
        receivable.getNextId = jasmine.createSpy('ReceivableCtrl.getNextId').andReturn(receivableId);

        log.error = jasmine.createSpy('$log.error');

        module('tnt.catalog.receivable.service');
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
     * Given an existing id
     * when read is triggered
     * then a copy of the receivable with that id must be returned
     * </pre>
     */
    it('should read a receivable', function() {
        // given
        var id = 1;

        // when
        var receivable = ReceivableService.read(id);

        // then
        expect(receivable).toEqual(DataProvider.receivables[0]);
        expect(receivable).not.toBe(DataProvider.receivables[0]);
    });

    /**
     * <pre>
     * Given a non-existent id
     * when read is triggered
     * then undefined must be returned
     * and must be logged: Receivable not found
     * </pre>
     */
    it('shouldn\'t return receivable instance', function() {
        // given
        var id = 2;

        // when
        var receivable = ReceivableService.read(id);

        // then
        expect(receivable).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith('ReceivableService.read: -Receivable not found: id=' + id);
    });

});