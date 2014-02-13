'use strict';

describe('Service: PurchaseOrderEntity', function() {

    var PurchaseOrder = null;
    var IdentityService = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder.entity');
        module(function($provide) {
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_PurchaseOrder_) {
        PurchaseOrder = _PurchaseOrder_;
    }));

    /**
     * <pre>
     * Givena order description
     * and a document
     * When new is triggered
     * Then a Order instance should be created
     * </pre>
     */
    it('should create a new PurchaseOrder instance', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var created = new Date(1234123);
        var amount = 123.45;
        var discount = 0;
        var points = 23;
        var items = [];

        // when
        var pOrder = new PurchaseOrder(uuid, created, amount, discount, points, items);

        // then
        expect(pOrder.uuid).toBe(uuid);
        expect(pOrder.created).toBe(created);
        expect(pOrder.items).toBe(items);

    });
});
