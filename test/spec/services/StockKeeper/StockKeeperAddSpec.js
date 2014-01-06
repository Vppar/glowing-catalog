'use strict';

describe('Service: StockKeeper', function() {

    var jKeeper = {};
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var StockKeeper = undefined;
    var Stock = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_StockKeeper_, _Stock_, _JournalEntry_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        JournalEntry =_JournalEntry_;
    }));
    
    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid productId
     * and a positive quantity
     * and a valid cost
     * when and add is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var pId = 23;
        var qty = 1;
        var ct = 0;
        var ev = new Stock(pId, qty, ct);
        var stp = fakeNow / 1000;
        var entry = new JournalEntry(null, stp, 'stockAdd', 1, ev); 

        expect(function() {
            StockKeeper.add(pId, qty, ct);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec StockKeeper.add#2
     * Given a negative quantity
     * when and add is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should throw error', function() {

        var pId = 23;
        var qty = -1;
        var ct = 0;

        expect(function() {
            StockKeeper.add(pId, qty, ct);}).toThrow();
    });

});
