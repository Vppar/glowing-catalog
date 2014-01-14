'use strict';

xdescribe('Service: ReceivableKeeperUpdate', function() {

    var Receivable = null;
    var ReceivableKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.keeper');
        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_Receivable_, _ReceivableKeeper_) {
        Receivable = _Receivable_;
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * </pre>
     */
    it('should ', function() {
        // given

        // when

        // then
    });
});
