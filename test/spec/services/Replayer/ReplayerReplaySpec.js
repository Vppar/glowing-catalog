'use strict';

describe('Service: Replayer', function() {

    // load the service's module
    beforeEach(function(){
    		module('tnt.catalog.journal.replayer');
    		module('tnt.catalog.stock');
    		module('tnt.catalog.stock.keeper');
    		module('tnt.catalog.stock.entity');
    		module('tnt.catalog.journal');
    		module('tnt.catalog.journal.entity');
            module('tnt.catalog.financial.math.service');
    });

    // instantiate service
    var Replayer = undefined;
    var Stock = undefined;
    var JournalEntry = undefined;
    var FinancialMathService = undefined;
    beforeEach(inject(function(_Replayer_, _Stock_, _JournalEntry_, _FinancialMathService_) {
        Replayer = _Replayer_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
        FinancialMathService = _FinancialMathService_;
    }));
    beforeEach(function(){
    	var func = function(){};
    	var handler = {stockAddV1: func};
    	Replayer.registerHandlers(handler);
    });
    
    /**
     * <pre>
     * @spec Replayer.replay#1
     * Given a JournalEntry 
     * with a valid event
     * when a replay is triggered
     * then the proper handler must be called
     * </pre>
     */
    it('should replay', function() {
    	
    	var ev = new Stock(5, 5, 0);
    	var entry = new JournalEntry(null, 1386179100, 'stockAdd', 1, ev);
        expect(function() {
            Replayer.replay(entry);
        }).not.toThrow();
    });
    
    /**
     * <pre>
     * @spec Replayer.replay#2
     * Given a JournalEntry
     * with an invalid type
     * when a replay is triggered
     * then an error must be raised
     * </pre>
     * 
     * TODO now it logs instead of raising
     */
    xit('should throw with invalid type', function() {
    	
    	var ev = new Stock(5, 5, 0);
    	var entry = new JournalEntry(null, 1386179100, 'stockExplode', 1, ev);
        expect(function() {
            Replayer.replay(entry);
        }).toThrow();
        
    });
    
    /**
     * <pre>
     * @spec Replayer.replay#3
     * Given a random object
     * when a replay is triggered
     * then an error must be raised
     * </pre>
     */
    it('should throw with invalid object', function() {
    	
    	var entry = {id: 123, name: 'oi'};
        expect(function() {
            Replayer.replay(entry);
        }).toThrow();
        
    });
    
});
