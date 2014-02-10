'use strict';
describe('Service: PurchaseOrderKeeperReadSpec', function() {

    var PurchaseOrderKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder.keeper');
        module('tnt.catalog.purchaseOrder.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_PurchaseOrderKeeper_) {
        PurchaseOrderKeeper = _PurchaseOrderKeeper_;
    }));

    /**
     * <pre>
     * Givena existing expense id     
     * When an get is triggered
     * Then the target expense should be returned
     * </pre>
     */
    it('should return a purchaseOrder', function() {
        // given
        var myPurchaseOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            code : 12,
            date : new Date(),
            customerId : 1,
            items : []
        };

        var yourPurchaseOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            code : 13,
            date : new Date(),
            customerId : 2,
            items : []
        };

        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](myPurchaseOrder);
        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](yourPurchaseOrder);

        // when
        var myResult = PurchaseOrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000001');
        var yourResult = PurchaseOrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000002');
        // Theres no order with id 2.
        var someoneResult = PurchaseOrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000003');

        // then
        expect(myPurchaseOrder).not.toBe(myResult);
        expect(yourPurchaseOrder).not.toBe(yourResult);

        expect(myPurchaseOrder.uuid).toBe(myResult.uuid);
        expect(yourPurchaseOrder.uuid).toBe(yourResult.uuid);

        expect(someoneResult).toEqual(undefined);

    });

    /**
     * <pre>
     * Givena missing order id     
     * When an read is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a purchaseOrder', function() {
        // given
        var myPurchaseOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            code : 12,
            date : new Date(),
            customerId : 1,
            items : []
        };
        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](myPurchaseOrder);

        // when
        var myResult = PurchaseOrderKeeper.read(123);

        // then
        expect(myResult).toBe(null);
    });

});
