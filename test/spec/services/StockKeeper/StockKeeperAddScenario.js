'use strict';

describe('Service: StockKeeperAddScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
    });

    var StockKeeper = undefined;
    var Stock = undefined;

    beforeEach(inject(function(_StockKeeper_, _Stock_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
    }));

    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid stock
     * when add is triggered
     * then a stock must be created
     * </pre>
     */
    it('add a new stock', function() {
        //givens
        var ev = new Stock(110, 4, 50);
        runs(function() {
            //when
            StockKeeper.add(ev);
        });

        waitsFor(function() {
            return StockKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            expect(StockKeeper.list().length).toBe(1);
            expect(StockKeeper.list()[0].inventoryId).toBe(ev.inventoryId);
            expect(StockKeeper.list()[0].quanitity).toBe(ev.quanitity);

        });
    });

    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a populated list with one stock
     * And stock entry with same inventoryId
     * when add is triggered
     * then a stock must be update with average cost and quantity sum
     * </pre>
     */
    it('updte stock', function() {
        //givens
        var ev = new Stock(110, 3, 10);
        var ev2 = new Stock(110, 5, 35);
        var finalQuantity = (ev.quantity + ev2.quantity);
        var finalPrice = ((ev.quantity * ev.cost) + (ev2.quantity * ev2.cost)) / (ev.quantity + ev2.quantity);
        runs(function() {
            //when
            StockKeeper.add(ev);
            StockKeeper.add(ev2);
        });

        waitsFor(function() {
            return StockKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            expect(StockKeeper.list().length).toBe(1);
            expect(StockKeeper.list()[0].inventoryId).toBe(110);
            expect(StockKeeper.list()[0].quantity).toBe(finalQuantity);
            expect(StockKeeper.list()[0].cost).toBe(finalPrice);
        });

    });

});
