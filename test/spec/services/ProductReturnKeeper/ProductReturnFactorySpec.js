'use strict';

describe('Service: ProductReturnFactorySpec', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.productReturn');
        module('tnt.catalog.productReturn.keeper');
        module('tnt.catalog.productReturn.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    var ProductReturn = undefined;
    beforeEach(inject(function(_ProductReturn_) {
        ProductReturn = _ProductReturn_;
    }));

    it('should creat a new ProductReturn entity', function() {
        // given
        var devId = 1;
        var pId = 23;
        var qty = 1;
        var ct = 5;
        var expectedArray = {
            id : devId,
            productId : pId,
            quantity : qty,
            cost : ct
        };

        // when
        var actual = new ProductReturn(devId, pId, qty, ct);

        // then
        expect(JSON.stringify(expectedArray)).toEqual(JSON.stringify(actual));

    });

    it('should throw error', function() {
        // given
        var pId = 23;
        var qty = -1;

        // then
        expect(function() {
            new ProductReturn(pId, qty);
        }).toThrow();

    });

});
