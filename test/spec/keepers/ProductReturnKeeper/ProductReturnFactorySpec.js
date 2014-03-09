'use strict';

describe('Service: ProductReturnFactorySpec', function () {

    // load the service's module
    beforeEach(function () {
        module('tnt.catalog.productReturn');
        module('tnt.catalog.productReturn.keeper');
        module('tnt.catalog.productReturn.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    var ProductReturn = undefined;
    beforeEach(inject(function (_ProductReturn_) {
        ProductReturn = _ProductReturn_;
    }));

    it('should creat a new ProductReturn entity', function () {
        // given
        var devId = 1;
        var pId = 23;
        var qty = 1;
        var ct = 5;
        var expectedArray = {
            id : devId,
            productId : pId,
            documentId : 4,
            quantity : qty,
            cost : ct
        };

        // when
        var actual = new ProductReturn(devId, pId, 4, qty, ct);

        // then
        expect(expectedArray.id).toEqual(actual.id);
        expect(expectedArray.productId).toEqual(actual.productId);
        expect(expectedArray.documentId).toEqual(actual.documentId);
        expect(expectedArray.quantity).toEqual(actual.quantity);
        expect(expectedArray.cost).toEqual(actual.cost);

    });

    it('should throw error', function () {
        // given
        var pId = 23;
        var qty = -1;

        // then
        expect(function () {
            new ProductReturn(pId, qty);
        }).toThrow();

    });

});
