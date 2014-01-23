'use strict';

describe('Service: OrderKeeperAdd', function() {

    var JournalEntry = null;
    var fakeNow = null;
    var jKeeper = {};
    var OrderKeeper = null;
    var Order = null;

    var id = 1;
    var code = 12;
    var date = new Date().getTime();
    var customerId = 1;
    var paymentIds = [];
    var items = [];

    var order = {
        id : id,
        code : code,
        date : date,
        customerId : customerId,
        paymentIds : paymentIds,
        items : items
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Order_, _OrderKeeper_, _JournalEntry_) {
        Order = _Order_;
        OrderKeeper = _OrderKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should add an order', function() {
        // given

        var orderx = new Order(order.id, order.code, order.date, order.canceled, order.customerId, order.paymentIds, order.items);

        var tstamp = fakeNow / 1000;
        var entry = new JournalEntry(null, tstamp, 'orderAdd', 1, orderx);

        // when
        var addCall = function() {
            OrderKeeper.add(order);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add an order', function() {
        // given
        var orderTest = angular.copy(order);
        orderTest.onemore = 'onemore';

        // when
        var addCall = function() {
            OrderKeeper.add(orderTest);
        };

        // then
        expect(addCall).toThrow('Unexpected property onemore');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle an add order event', function() {
        // given
        var orderx = new Order(order);

        // when
        OrderKeeper.handlers['orderAddV1'](orderx);
        var orders = OrderKeeper.list();

        // then
        expect(orders[0]).not.toBe(orderx);
        expect(orders[0]).toEqual(orderx);

    });
});