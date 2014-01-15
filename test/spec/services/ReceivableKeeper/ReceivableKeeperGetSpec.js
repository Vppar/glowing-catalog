'use strict';
describe('Service: ReceivableKeeperGet', function() {

    var ReceivableKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.receivable.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_ReceivableKeeper_) {
        ReceivableKeeper = _ReceivableKeeper_;
    }));

    /**
     * <pre>
     * Given a existing receivable id     
     * When an get is triggered
     * Then the target receivable should be returned
     * </pre>
     */
    it('should return a receivable', function() {
        // given
        var myReceivable = {
            id : 1,
            stub : 'i\'m a stub 1'
        };
        var yourReceivable = {
            id : 2,
            stub : 'i\'m a stub 2'
        };
        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);
        ReceivableKeeper.handlers['receivableAddV1'](yourReceivable);
        var receivables = ReceivableKeeper.list();

        // when
        var myResult = ReceivableKeeper.get(receivables[0].id);
        var yourResult = ReceivableKeeper.get(receivables[1].id);

        // then
        expect(myReceivable).not.toBe(myResult);
        expect(yourReceivable).not.toBe(yourResult);
        expect(myReceivable.stub).toBe(myReceivable.stub);
        expect(yourReceivable.stub).toBe(yourResult.stub);

    });

    /**
     * <pre>
     * Given a missing receivable id     
     * When an get is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a receivable', function() {
        // given
        var myReceivable = {
            stub : 'i\'m a stub 1'
        };
        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);

        // when
        var myResult = ReceivableKeeper.get(123);

        // then
        expect(myResult).toBe(null);
    });

});
