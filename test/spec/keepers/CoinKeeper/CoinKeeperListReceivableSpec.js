// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperListReceivable', function() {

    var ReceivableKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    beforeEach(inject(function(CoinKeeper) {
        ReceivableKeeper = CoinKeeper('receivable');
    }));

    /**
     * <pre>
     * Given a filled CoinKeeperReceivable     
     * When list is triggered
     * Then the target receivable should be returned
     * </pre>
     */
    it('should return a list of receivable', function() {
        // given
        var myReceivableEv = {
            entityId : 1,
            documentId : 2
        };
        var yourReceivableEv = {
            entityId : 2,
            documentId : 1
        };

        ReceivableKeeper.handlers['receivableAddV1'](myReceivableEv);
        ReceivableKeeper.handlers['receivableAddV1'](yourReceivableEv);

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(myReceivableEv.entityId).toEqual(receivables[0].entityId);
        expect(myReceivableEv.documentId).toEqual(receivables[0].documentId);
        expect(yourReceivableEv.entityId).toEqual(receivables[1].entityId);
        expect(yourReceivableEv.documentId).toEqual(receivables[1].documentId);
    });

    /**
     * <pre>
     * Given an empty CoinKeeperReceivable    
     * When an get is triggered
     * Then an empty array must be returned
     * </pre>
     */
    it('shouldn\'t return a receivable', function() {
        // given

        // when
        var receivables = ReceivableKeeper.list();

        // then
        expect(receivables.length).toBe(0);
    });

});