'use strict';

describe('Service: StockKeeperRemoveSpec', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.stock');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
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
    var ArrayUtils = undefined;
    beforeEach(inject(function(_StockKeeper_, _Stock_, _JournalEntry_, _ArrayUtils_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        JournalEntry = _JournalEntry_;
        ArrayUtils = _ArrayUtils_;
    }));

    /**
     * <pre>
     * @spec StockKeeper.remove#1
     * Given a valid stock
     * and a positive quantity
     * when remove is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('remove stock', function() {
        //given
        var ev = new Stock(23, 1, null);
        var ev1 = new Stock(12, 1, 0);

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockAddV1(ev1);

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var stp = fakeNow;
        var entry = new JournalEntry(null, stp, 'stockRemove', 1, ev);

        var removeCall = function() {
            StockKeeper.remove(ev.inventoryId, ev.quantity);
        };
        expect(removeCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    /**
     * <pre>
     * @spec StockKeeper.remove#1
     * Given a populated list of stockable
     * And a valid inventoryId
     * And a positive quantity
     * when stockRemoveV1 is triggered
     * Then the stock must be updated removing the quantity
     * </pre>
     */
    it('handler remove stock', function() {
        //given
        var ev = new Stock(23, 30, null);
        var ev1 = new Stock(12, 1, 0);

        StockKeeper.handlers.stockAddV1(ev);
        StockKeeper.handlers.stockAddV1(ev1);
        //when
        var removeCall = function() {
            StockKeeper.handlers.stockRemoveV1(ev);
        };
        //then
        expect(removeCall).not.toThrow();
        expect(StockKeeper.list().length).toEqual(2);
        var stock = ArrayUtils.find(StockKeeper.list(), 'inventoryId', ev.inventoryId);
        expect(stock.quantity).toEqual(0);
    });

    /**
     * <pre>
     * @spec StockKeeper.remove#2
     * Given a invalid stock
     * when stockRemoveV1 is triggered
     * then an error must be raised
     * </pre>
     */
    it('handler throw error', function() {
        var fakeStock = {
            pId : 23,
            qty : -1,
            ct : 0
        };

        var removeCall = function() {
            StockKeeper.handlers.stockRemoveV1(fakeStock);
        };

        expect(removeCall).toThrow('Entity not found, cosistency must be broken! Replay?');
    });

});
