'use strict';

describe('Service: StockKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.journal.replayer');
        module('tnt.catalog.journal');
        module('tnt.catalog.financial.math.service');
    });

    // instantiate service
    var StockKeeper = undefined;
    var FinancialMathService = undefined;
    beforeEach(inject(function(_StockKeeper_, _FinancialMathService_) {
        StockKeeper = _StockKeeper_;
        FinancialMathService = _FinancialMathService_;
    }));

    it('should do something', function() {
        expect(!!StockKeeper).toBe(true);
    });

});
