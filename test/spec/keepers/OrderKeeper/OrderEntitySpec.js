'use strict';

describe('Service: OrderEntity', function() {

    var Order = null;
    var IdentityService = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.entity');
        module(function($provide) {
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Order_) {
        Order = _Order_;
    }));

    /**
     * <pre>
     * Given a order description
     * and a document
     * When new is triggered
     * Then a Order instance should be created
     * </pre>
     */
    it('should create a new Order instance', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var code = 12;
        var date = new Date();
        var canceled = false;
        var customerId = 1;
        var items = [];

        // when
        var order = new Order(uuid, code, date, canceled, customerId, items);

        // then
        expect(order.uuid).toBe(uuid);
        expect(order.code).toBe(code);
        expect(order.date).toBe(date);
        expect(order.canceled).toBe(canceled);
        expect(order.customerId).toBe(customerId);
        expect(order.items).toBe(items);

    });
});
