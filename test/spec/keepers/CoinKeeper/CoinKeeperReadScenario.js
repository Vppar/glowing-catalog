// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperReadScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.coin.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    var CoinKeeper = undefined;
    var Coin = undefined;
    
    var entryType = 'plunder';
    var version = 'V1';
    var myAddFunction = entryType+'Add'+version;
    var fakeNow = 1386179100000;

    beforeEach(inject(function(_CoinKeeper_, _Coin_) {
        CoinKeeper = _CoinKeeper_(entryType);
        Coin = _Coin_;
    }));

    /**
     * <pre>
     * @spec CoinKeeper.read#1
     * Given a valid id of entry 
     * when read is triggered
     * then a entry must be returned
     * </pre>
     */
    it('read a coin', function() {
        //given
        CoinKeeper.handlers[myAddFunction](new Coin(1, fakeNow, 11, 'check', 40, fakeNow));
        CoinKeeper.handlers[myAddFunction](new Coin(2, fakeNow, 13, 'cash', 30, fakeNow));
        // when / then
        expect(CoinKeeper.read(2).id).toBe(2);
        expect(CoinKeeper.read(2).type).toBe('cash');
        expect(CoinKeeper.read(2).amount).toBe(30);
    });
    
    
    /**
     * <pre>
     * @spec CoinKeeper.read#1
     * Given a populated list
     * And a invalid id
     * when read is triggered
     * then a null object must be returned
     * </pre>
     */
    it('not return a Order', function() {
        runs(function(){
            CoinKeeper.handlers[myAddFunction](new Coin(1, fakeNow, 11, 'check', 300, fakeNow));
        });
        
        waitsFor(function(){
            return CoinKeeper.list().length;
        }, 'JournalKeeper is taking too long');
        
        runs(function(){
            expect(CoinKeeper.read(2)).toBe(null);
        });
    });
    
    
});
