'use strict';

describe('Service: PurchaseOrderKeeperListSpec', function() {

    var PurchaseOrderKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder.keeper');
        module('tnt.catalog.purchaseOrder.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    beforeEach(inject(function(_PurchaseOrderKeeper_) {
        PurchaseOrderKeeper = _PurchaseOrderKeeper_;
    }));

    /**
     * <pre>
     * GivenafilledOrderKeeperWhenlististriggered
     * Then the target order should be returned
     * </pre>
     */
    it('should return a list of purchaseOrders', function() {
        // given
        var myPurchaseOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            created : new Date(),
            canceled : false,
            items : []
        };

        var yourPurchaseOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            created : new Date(),
            canceled : false,
            items : []
        };

        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](myPurchaseOrder);
        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](yourPurchaseOrder);

        // when
        var purchases = PurchaseOrderKeeper.list();

        // then
        expect(myPurchaseOrder.uuid).toEqual(purchases[0].uuid);
        expect(myPurchaseOrder.customerId).toEqual(purchases[0].customerId);
        expect(yourPurchaseOrder.uuid).toEqual(purchases[1].uuid);
        expect(yourPurchaseOrder.customerId).toEqual(purchases[1].customerId);
    });

    /**
     * <pre>
     * GivenanemptyOrderKeeperWhenanlististriggered
     * Then an empty array must be returned
     * </pre>
     */
    it('shouldn\'t return a purchaseOrder', function() {
        // given

        // when
        var purchasess = PurchaseOrderKeeper.list();

        // then
        expect(purchasess.length).toBe(0);
    });

});