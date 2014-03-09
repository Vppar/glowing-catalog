// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeper.liquidate', function() {

    beforeEach(function() {
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.utils.array');
    });

    var CoinKeeper = undefined;
    var Coin = undefined;
    
    var entryType = 'plunder';
    var version = 'V1';
    var ArrayUtils = undefined;
    var myAddFunction = entryType+'Add'+version;
    var fakeNow = 1386179100000;
    
    beforeEach(inject(function(_CoinKeeper_, _Coin_, _ArrayUtils_) {
        CoinKeeper = _CoinKeeper_(entryType);
        Coin = _Coin_;
        ArrayUtils = _ArrayUtils_;
    }));

    /**
     * <pre>
     * @spec CoinKeeper.liquidate#1
     * Given a populated list of entries
     * And a valid id
     * when liquidate is triggered
     * then a entry must be liquidated
     * </pre>
     */
    
    it('liquidate an expense', function() {
        var idToLiquidate = 1;
        
        runs(function() {
            CoinKeeper.handlers[myAddFunction](new Coin(1, fakeNow, 11, 'cash', 40, fakeNow));
            CoinKeeper.handlers[myAddFunction](new Coin(2, fakeNow, 12, 'check', 20, fakeNow));
            CoinKeeper.liquidate(idToLiquidate,new Date());
        });

        waitsFor(function() {
            return CoinKeeper.list()[0].liquidated;
        }, 'JournalKeeper is taking too long');

        runs(function() {
            var entry = ArrayUtils.find(CoinKeeper.list(), 'id', idToLiquidate);
            expect(entry.liquidated instanceof Date).toBe(true);
        });
    });

    /**
     * <pre>
     * @spec CoinKeeper.liquidate#1
     * Given a populated list of entries
     * And invalid id of entry
     * when liquidate is triggered
     * then a exception must be throw
     * </pre>
     */
    it('Should throw a exception', function() {
        var id = 3;
        CoinKeeper.handlers[myAddFunction](new Coin(1, fakeNow, 11, 'cash', 40, fakeNow));
        CoinKeeper.handlers[myAddFunction](new Coin(2, fakeNow, 12, 'check', 20, fakeNow));
        var createCall = function(){CoinKeeper.liquidate(id,new Date());};
        
        expect(createCall).toThrow('Unable to find a ' + entryType + ' with id=\'' + id + '\'');
    });

});
