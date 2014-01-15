describe('Service: ReceivableServiceisValidSpec', function() {

    var log = {};
    var fakeTime = 1386444467895;
    var monthTime = 2592000;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.receivable.service');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');

        spyOn(Date.prototype, 'getTime').andReturn(fakeTime);
        log.debug = jasmine.createSpy('$log.debug');

        module(function($provide) {
            $provide.value('$log', log);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Givena valid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given
        var receivable = {
            creationdate : fakeTime,
            entityId : 1,
            type : 'BRINDE',
            amount : 1234.56,
            installmentSeq : 1,
            duedate : fakeTime + monthTime
        };
        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result).toBe(true);
        expect(log.debug).not.toHaveBeenCalled();
    });

    /**
     * <pre>
     * Givena invalid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given

        var receivable = {
            creationdate : fakeTime + monthTime,
            amount : -1234.56,
            duedate : fakeTime - monthTime
        };

        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result).toBe(false);
        expect(log.debug).toHaveBeenCalled();
    });

});