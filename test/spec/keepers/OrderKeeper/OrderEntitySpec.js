'use strict';

describe('Service: OrderEntity', function() {

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
     * Given a order description
     * and a document
     * When new is triggered
     * Then a Order instance should be created
     * </pre>
     */
    it('should create a new PurchaseOrder instance', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var code = 12;
        var date = new Date();
        var canceled = false;
        var customerId = 1;
        var items = [];

        // when
        var purchase = new PurchaseOrder(uuid, code, date, canceled, customerId, items);

        // then
        expect(purchase.uuid).toBe(uuid);
        expect(purchase.code).toBe(code);
        expect(purchase.date).toBe(date);
        expect(purchase.canceled).toBe(canceled);
        expect(purchase.customerId).toBe(customerId);
        expect(purchase.items).toBe(items);

    });
});
