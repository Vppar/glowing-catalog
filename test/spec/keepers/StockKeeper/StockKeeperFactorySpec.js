'use strict';

describe('Service: StockKeeperFactorySpec', function() {

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

    // instantiate service
    var Stock = undefined;
    var FinancialMathService = undefined;
    beforeEach(inject(function(_Stock_, _FinancialMathService_) {
        Stock = _Stock_;
        FinancialMathService = _FinancialMathService_;
    }));

    it('should creat a new Stock entity', function() {
        //given
        var pId = 23;
        var qty = 1;
        var ct = 0;

        //when
        var actual = new Stock(pId, qty, ct);

        //then
        expect(pId).toEqual(actual.inventoryId);
        expect(qty).toEqual(actual.quantity);
        expect(ct).toEqual(actual.cost);

    });

    it('should throw error', function() {
        //given
        var pId = 23;
        var qty = -1;

        //then
        expect(function() {
            new Stock(pId, qty);
        }).toThrow();

    });

});
