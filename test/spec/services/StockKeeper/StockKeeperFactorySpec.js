'use strict';

describe('Service: StockKeeper', function() {
	
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    var Stock = undefined;
    beforeEach(inject(function(_Stock_) {
        Stock = _Stock_;
    }));
    
    it('should creat a new Stock entity', function() {
        //given
        var pId = 23;
        var qty = 1;
        var ct = 0;
        var expectedArray = {inventoryId: pId, quantity: qty, cost: ct};
        
        //when
        var actual = new Stock(pId, qty, ct);
        
        //then
        expect(expectedArray).toEqual(actual);
     
    });
    
    it('should throw error', function() {
        //given
        var pId = 23;
        var qty = -1;
        
        //then
        expect(function(){new Stock(pId, qty);}).toThrow();
     
    });
    
});
