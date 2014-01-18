describe('Service: ReceivableServiceisValid', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var monthTime = 2592000;
    var DialogService = {};

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.receivable.service');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        log.debug = jasmine.createSpy('$log.debug');

        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('DialogService', DialogService);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;        
    }));

    /**
     * <pre>
     * Given a valid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given
        var receivable = {
            creationdate : fakeNow,
            entityId : 1,
            type : 'BRINDE',
            amount : 1234.56,
            installmentSeq : 1,
            duedate : fakeNow + monthTime
        };
        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result.length).toEqual(0);
    });

    /**
     * <pre>
     * Given a invalid receivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given

        var receivable = {
            creationdate : fakeNow - monthTime,
            amount : 1234.56,
            duedate : fakeNow + monthTime
        };

        // when
        var result = ReceivableService.isValid(receivable);
        
        // then
        expect(result.length).toEqual(3);
    });

});