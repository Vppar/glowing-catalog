// FIXME - This whole test suit needs review
xdescribe('Service: CoinKeeperAddScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.coin.keeper');
        module('tnt.catalog.receivable.entity');
        module('tnt.catalog.expense.entity');
        module('tnt.catalog.coin.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    var CoinKeeper = undefined; 
    var Coin = undefined;
    var myCoinType = 'myCoinKeeper';
    
    beforeEach(inject(function(_CoinKeeper_, _Coin_) {
        CoinKeeper = _CoinKeeper_(myCoinType);
        Coin = _Coin_;
    }));

    /**
     * <pre>
     * @spec CoinKeeper.add#1
     * Given a valid entry
     * when add is triggered
     * then a entry must be created
     * </pre>
     */
    it('add an expense', function() {
        runs(function() {
            var id = 1;
            var created= new Date();
            var entityId = 12;
            var type = 'cash';
            var amount = 50;
            var duedate= new Date();

            var ev = new Coin(id, created, entityId, type, amount, duedate);
            CoinKeeper.add(ev);
        });

        waitsFor(function() {
            return CoinKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(CoinKeeper.list().length).toBe(1);
            expect(CoinKeeper.list()[0].entityId).toBe(12);
            expect(CoinKeeper.list()[0].amount).toBe(50);
        });
    });
    
    /**
     * <pre>
     * @spec CoinKeeper.add#1
     * Given a invalid entry
     * when add is triggered
     * then a exception must be throw
     * </pre>
     */
    it('Should throw a exception', function() {
        var ev = {
            id : 1,
            created : new Date(),
            entityId : 12,
            type : 'cash',
            amount : 50,
            duedate : new Date()
        };

        var createCall = function() {
            CoinKeeper.add(ev);
        };

        expect(createCall).toThrow('Wrong instance to CoinKeeper');
    });

});
