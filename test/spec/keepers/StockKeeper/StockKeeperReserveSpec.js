'use strict';

describe('StockKeeperReserveSpec', function() {

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
    var ArrayUtils = undefined;
    beforeEach(inject(function(_StockKeeper_, _Stock_, _JournalEntry_, _ArrayUtils_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
        ArrayUtils = _ArrayUtils_;
    }));
    
    /**
     * <pre>
     * @spec StockKeeper.reserve#1
     * Given a valid inventoryId
     * and a reserve
     * when and reserve is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('reserve stock', function() {
        
        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var ev = new Stock(23, 5, 10);
        
        StockKeeper.handlers.stockAddV1(ev);
        
        StockKeeper.reserve(23, 3);
        
        var stp = fakeNow;
        ev.quantity = null;
        ev.cost = null;
        ev.reserve = 3;
        var entry = new JournalEntry(null, stp, 'stockReserve', 1, ev);
        
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec StockKeeper.reserve#2
     * Given a valid stock instance
     * with reserve value
     * when stockReserveV1 is triggered
     * then stock must be reserved
     * </pre>
     */
    it('handler reserve', function() {

        var ev = new Stock(23, 6, 10);
        var ev1 = new Stock(23, null, null);
        ev1.reserve = 2;

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockReserveV1(ev1);

        var list = StockKeeper.list();
        expect(list[0].reserve).toBe(2);
    });
    
    /**
     * <pre>
     * @spec StockKeeper.reserve#3
     * Given a valid stock instance
     * with reserve value
     * when stockReserveV1 is triggered
     * then stock must be updated
     * </pre>
     */
    it('handler reserve of existent reserved stock', function() {

        var ev = new Stock(23, 30, 15);
        var ev2 = new Stock(23, null, null);
        ev2.reserve = 10;
        var ev3 = new Stock(23, null, null);
        ev3.reserve = 14;
        var finalReserve = (ev.reserve + ev2.reserve + ev3.reserve);

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockReserveV1(ev2);
        StockKeeper.handlers.stockReserveV1(ev3);

        expect(StockKeeper.list().length).toEqual(1);
        expect(StockKeeper.list()[0].reserve).toEqual(finalReserve);

    });
    
    /**
     * <pre>
     * @spec StockKeeper.reserve#4
     * Given a invalid stock instance
     * when stockReserveV1 is triggered
     * then stock must be create
     * </pre>
     */
    it('handler reserve of nonexistent stock', function() {
        var ev1 = new Stock(1, 1, 1);
        
        ev1.reserve = 5;
        spyOn(ArrayUtils, 'find').andReturn(null);
        var reserve = StockKeeper.handlers.stockReserveV1(ev1);
        expect(reserve).toEqual(5);
        
    });

});
