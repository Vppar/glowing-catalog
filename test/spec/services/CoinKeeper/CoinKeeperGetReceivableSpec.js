// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperGetReceivableSpec', function() {

    var ReceivableKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(CoinKeeper) {
        ReceivableKeeper = CoinKeeper('receivable');
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
            entityId : 2
        };
        var yourReceivable = {
            id : 2,
            entityId : 1
        };
        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);
        ReceivableKeeper.handlers['receivableAddV1'](yourReceivable);
        var receivables = ReceivableKeeper.list();

        // when
        var myResult = ReceivableKeeper.read(receivables[0].id);
        var yourResult = ReceivableKeeper.read(receivables[1].id);

        // then
        expect(myReceivable).not.toBe(myResult);
        expect(yourReceivable).not.toBe(yourResult);
        expect(myReceivable.entityId).toBe(myReceivable.entityId);
        expect(yourReceivable.entityId).toBe(yourResult.entityId);

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
            id : 1,
            entityId : 2
        };
        ReceivableKeeper.handlers['receivableAddV1'](myReceivable);

        // when
        var myResult = ReceivableKeeper.read(123);

        // then
        expect(myResult).toBe(null);
    });

});
