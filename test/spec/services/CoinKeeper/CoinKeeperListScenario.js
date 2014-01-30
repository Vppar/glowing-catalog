'use strict';

describe('Service: CoinKeeper.List', function() {

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
     * @spec CoinKeeper.list#1
     * Given a empty list of entries
     * when list is triggered
     * then empty list must be returned.
     * </pre>
     */
   it('list 0 items', function() {
       //given
       
       //when 
       
       //then
       expect(CoinKeeper.list().length).toBe(0);
    });
    
   /**
    * <pre>
    * @spec CoinKeeper.list#1
    * Given a populated list with four entries
    * when and list is triggered
    * then a list must be returned with four entries
    * </pre>
    */
   it('return list with 4 items', function() {
       //given
       CoinKeeper.handlers[myAddFunction](new Coin(null, fakeNow, 11, 'check', 300, fakeNow));
       CoinKeeper.handlers[myAddFunction](new Coin(null, fakeNow, 12, 'cash', 10, fakeNow));
       CoinKeeper.handlers[myAddFunction](new Coin(null, fakeNow, 13, 'creditCard', 30, fakeNow));
       CoinKeeper.handlers[myAddFunction](new Coin(null, fakeNow, 13, 'cash', 30, fakeNow));

       //when
       var myNewList = CoinKeeper.list();

       //then
       expect(myNewList.length).toBe(4);
   });

});
