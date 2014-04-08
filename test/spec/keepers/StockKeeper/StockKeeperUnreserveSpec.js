'use strict';

describe('StockKeeperUnreserveSpec', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.financial.math.service');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    var StockKeeper = undefined;
    var Stock = undefined;
    var JournalEntry = undefined;
    var FinancialMathService = undefined;
    beforeEach(inject(function(_StockKeeper_, _Stock_, _JournalEntry_, _FinancialMathService_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
        FinancialMathService = _FinancialMathService_;
    }));
    
    /**
     * <pre>
     * @spec StockKeeper.unreserve#1
     * Given a valid inventoryId
     * and a unreserve
     * when and unreserve is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('unreserve stock', function() {
        
        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var ev = new Stock(23, 5, 10);
        
        StockKeeper.handlers.stockAddV1(ev);
        
        StockKeeper.unreserve(23, 3);
        
        var stp = fakeNow;
        ev.quantity = null;
        ev.cost = null;
        ev.reserve = 3;
        var entry = new JournalEntry(null, stp, 'stockUnreserve', 1, ev);
        
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec StockKeeper.unreserve#2
     * Given a valid stock instance
     * with unreserve value
     * when stockUnreserveV1 is triggered
     * then stock must be unreserved
     * </pre>
     */
    it('handler unreserve', function() {

        var ev = new Stock(23, 6, 10);
        ev.reserve = 4;
        var ev1 = new Stock(23, null, null);
        ev1.reserve = 2;

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockUnreserveV1(ev1);

        var list = StockKeeper.list();
        expect(list[0].reserve).toBe(2);
    });
    
    /**
     * <pre>
     * @spec StockKeeper.unreserve#3
     * Given a valid stock instance
     * with unreserve value
     * when stockUnreserveV1 is triggered
     * then stock must be updated
     * </pre>
     */
    it('handler unreserve of existent unreserved stock', function() {

        var ev = new Stock(23, 30, 15);
        ev.reserve = 30;
        var ev2 = new Stock(23, null, null);
        ev2.reserve = 10;
        var ev3 = new Stock(23, null, null);
        ev3.reserve = 14;
        var finalReserve = (ev.reserve - ev2.reserve - ev3.reserve);

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockUnreserveV1(ev2);
        StockKeeper.handlers.stockUnreserveV1(ev3);

        expect(StockKeeper.list().length).toEqual(1);
        expect(StockKeeper.list()[0].reserve).toEqual(finalReserve);

    });

});
