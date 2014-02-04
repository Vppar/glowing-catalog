'use strict';

ddescribe('Service: StockKeeperAddSpec', function() {

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
        JournalEntry = _JournalEntry_;
    }));

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

        var addCall = function() {
            StockKeeper.handlers.stockAddV1(ev);
            StockKeeper.handlers.stockAddV1(ev1);
        };

        expect(addCall).not.toThrow();
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

        var ev = new Stock(23, 20, 15);
        var ev2 = new Stock(23, 5, 15);
        var finalQuantity = (ev.quantity + ev2.quantity);
        var finalPrice = ((ev.quantity * ev.cost) + (ev2.quantity * ev2.cost)) / finalQuantity;

        var addCall = function() {
            StockKeeper.handlers.stockAddV1(ev);
            StockKeeper.handlers.stockAddV1(ev2);
        };

        expect(addCall).not.toThrow();
        expect(StockKeeper.list().length).toEqual(1);
        expect(StockKeeper.list()[0].quantity).toEqual(finalQuantity);
        expect(StockKeeper.list()[0].cost).toEqual(finalPrice);

    });

});
