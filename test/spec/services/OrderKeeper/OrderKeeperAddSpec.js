'use strict';

describe('Service: OrderKeeperAddSpec', function() {

    var fakeNow = null;
    var JournalEntry = null;
    var OrderKeeper = null;
    var Order = null;
    var IdentityService = null;
    var jKeeper = {};

    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var code = '01-0001-14';
    var date = new Date().getTime();
    var customerId = 1;
    var items = [];

    var order = {
        uuid : uuid,
        code : code,
        date : date,
        customerId : customerId,
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
    beforeEach(inject(function(_Order_, _OrderKeeper_, _JournalEntry_, _IdentityService_) {
        Order = _Order_;
        OrderKeeper = _OrderKeeper_;
        JournalEntry = _JournalEntry_;
        IdentityService =_IdentityService_;
    }));

    it('should add an order', function() {
        // given
        var orderx = new Order(order);
        orderx.created = fakeNow;

        var entry = new JournalEntry(null, orderx.created, 'orderAdd', 1, orderx);
        
        spyOn(IdentityService, 'getUUID').andReturn(orderx.uuid);

        // when
        var addCall = function() {
            OrderKeeper.add(orderx);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add an order', function() {
        // given
        var orderTest = new Order(order);
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