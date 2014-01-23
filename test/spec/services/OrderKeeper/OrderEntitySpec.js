'use strict';

describe('Service: OrderEntity', function() {

    var Order = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.entity');
    });

    // instantiate service
    beforeEach(inject(function(_Order_) {
        Order = _Order_;
    }));

    /**
     * <pre>
     * Givena order description
     * and a document
     * When new is triggered
     * Then a Order instance should be created
     * </pre>
     */
    it('should create a new Order instance', function() {
        // given
        var id = 1;
        var code = 12;
        var date = new Date();
        var canceled = false;
        var customerId = 1;
        var items = [];

        // when
        var order = new Order(id, code, date, canceled, customerId, items);

        // then
        expect(order.id).toBe(id);
        expect(order.code).toBe(code);
        expect(order.date).toBe(date);
        expect(order.canceled).toBe(canceled);
        expect(order.customerId).toBe(customerId);
        expect(order.items).toBe(items);

    });
});
