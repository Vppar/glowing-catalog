'use strict';

describe('Service: StockKeeper', function() {

    var jKeeper = {};
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var StockKeeper = undefined;
    beforeEach(inject(function(_StockKeeper_) {
        StockKeeper = _StockKeeper_;
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

        var pId = 23;
        var qty = 1;
        var ct = 0;
//        var ev = {productId: pId, quantity: qty, cost: ct};
//        var stp = (new Date()).getTime() / 1000;
//        var entry = {
//                sequence: null,
//                stamp: stp,
//                type: 'stockAdd', 
//                version: 1,
//                event: ev
//                };

        expect(function() {
            StockKeeper.add(pId, qty, ct);}).not.toThrow();
//        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
        expect(jKeeper.compose).toHaveBeenCalled();
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
