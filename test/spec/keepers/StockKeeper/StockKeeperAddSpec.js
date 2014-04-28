'use strict';

describe('Service: StockKeeperAddSpec', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
    var FinancialMathService = {};

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

    beforeEach(inject(function(_StockKeeper_, _Stock_, _JournalEntry_, _FinancialMathService_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
        FinancialMathService = _FinancialMathService_;
    }));
    
    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid inventoryId
     * and a positive quantity
     * and a valid cost
     * when and add is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('add stock', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var ev = new Stock(23, 1, 0);
        var stp = fakeNow;
        var entry = new JournalEntry(null, stp, 'stockAdd', 1, ev);

        StockKeeper.add(ev);
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid invenotryId
     * and a positive quantity
     * and a valid cost
     * when stockAddV1 is triggered
     * then stock must be registered
     * </pre>
     */
    it('handler add', function() {

        var ev = new Stock(23, 1, 0);
        var ev1 = new Stock(12, 1, 0);

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockAddV1(ev1);

        expect(StockKeeper.list().length).toEqual(2);
    });

    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid inventoryId
     * And invenotryId already exist
     * And a positive quantity
     * And a valid cost
     * When stockAddV1 is triggered
     * Then stock must be updated
     * </pre>
     */
    it('handler add of existent stock', function() {

        var ev = new Stock(24, 20, 15);
        var ev2 = new Stock(24, 5, 15);
        var finalQuantity = (ev.quantity + ev2.quantity);
        var finalPrice = ((ev.quantity * ev.cost) + (ev2.quantity * ev2.cost)) / finalQuantity;

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockAddV1(ev2);

        expect(StockKeeper.list().length).toEqual(1);
        expect(StockKeeper.list()[0].quantity).toEqual(finalQuantity);
        expect(StockKeeper.list()[0].cost).toEqual(finalPrice);

    });

});
