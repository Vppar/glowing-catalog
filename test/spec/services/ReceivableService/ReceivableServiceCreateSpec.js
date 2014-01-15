xdescribe('Service: ReceivableServiceCreateSpec', function() {

    var log = {};

    // load the service's module
    beforeEach(function() {
        var dpStub = {
            receivables : []
        };
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
     * Given a validated receivable
     * when a create is triggered
     * then a unique id must be set
     * and a creation date must be set
     * and canceled flag must be set to false
     * and received attribute must be undefined
     * and a receivable must be created in the database
     * and the id must be returned
     * </pre>
     */
    it('should create a receivable instance', function() {
        // given
        var receivable = {
            stub : 'I\'m a stub'
        };

        var fakeTime = 1386444467895;
        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);

        // when
        var id = ReceivableService.create(receivable);

        // then
        expect(log.error).not.toHaveBeenCalled();
        expect(id).not.toBeUndefined();
        expect(receivable.createdate).toEqual(fakeTime);
        expect(receivable.canceled).toBe(false);
    });

});