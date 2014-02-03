// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperCancelScenario', function() {

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
     * @spec CoinKeeper.cancel#1
     * Given a populated list of entries
     * And a valid id
     * when cancel is triggered
     * then a entry must be canceled
     * </pre>
     */
    
    it('cancel an entry', function() {
        var idToLiquidate = 1;
        runs(function() {
            CoinKeeper.handlers[myAddFunction](new Coin(1, fakeNow, 11, 'cash', 40, fakeNow));
            CoinKeeper.handlers[myAddFunction](new Coin(2, fakeNow, 12, 'check', 20, fakeNow));
            
            CoinKeeper.cancel(idToLiquidate);
            
        });

        waitsFor(function() {
            return CoinKeeper.list()[0].canceled;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            var entry = ArrayUtils.find(CoinKeeper.list(), 'id', 1);
            expect(entry.canceled).not.toBe(undefined);
            
            var entry2 = ArrayUtils.find(CoinKeeper.list(), 'id', 2);
            expect(entry2.entityId).toBe(12);
            expect(entry2.canceled).toBe(undefined);
        });
    });

    /**
     * <pre>
     * @spec CoinKeeper.cancel#1
     * Given a invalid entry
     * when add is triggered
     * then a exception must be throw
     * </pre>
     */
    it('throw an exception', function() {
        var id = 3;
        var createCall = function() {
            CoinKeeper.cancel(id);
        };

        expect(createCall).toThrow('Unable to find a ' + entryType + ' with id=\'' + id + '\'');
    });

});
