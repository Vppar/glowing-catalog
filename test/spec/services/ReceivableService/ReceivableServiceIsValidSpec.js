// FIXME - This whole suit test needs review
xdescribe('Service: ReceivableServiceisValid', function() {

    var log = {};
    var fakeNow = 1386444467895;
    var monthTime = 2592000;
    var DialogService = {};
    var CoinKeeper = function() {
    };

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.receivable.service');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.keeper');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        log.debug = jasmine.createSpy('$log.debug');

        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('DialogService', DialogService);
            $provide.value('CoinKeeper', CoinKeeper);
        });
    });
    beforeEach(inject(function(_ReceivableService_) {
        ReceivableService = _ReceivableService_;
    }));

    /**
     * <pre>
     * Givenavalidreceivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given
        var receivable = {
            created : fakeNow,
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
     * Givenainvalidreceivable
     * When isValid is triggered
     * Then true should be returned
     * </pre>
     */
    it('should validate a receivable instance', function() {
        // given

        var receivable = {
            created : fakeNow - monthTime,
            amount : 1234.56,
        };

        // when
        var result = ReceivableService.isValid(receivable);

        // then
        expect(result.length).toEqual(2);
    });

});