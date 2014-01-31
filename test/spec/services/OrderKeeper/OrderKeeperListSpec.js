'use strict';

describe('Service: OrderKeeperListSpec', function() {

    var OrderKeeper = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    // instantiate service
    beforeEach(inject(function(_OrderKeeper_) {
        OrderKeeper = _OrderKeeper_;
    }));

    /**
     * <pre>
     * GivenafilledOrderKeeperWhenlistis triggered
     * Then the target order should be returned
     * </pre>
     */
    it('should return a list of orders', function() {
        // given
        var myOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            code : 12,
            date : new Date(),
            customerId : 1,
            items : []
        };

        var yourOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
            code : 13,
            date : new Date(),
            customerId : 2,
            items : []
        };

        OrderKeeper.handlers['orderAddV1'](myOrder);
        OrderKeeper.handlers['orderAddV1'](yourOrder);

        // when
        var orders = OrderKeeper.list();

        // then
        expect(myOrder.uuid).toEqual(orders[0].uuid);
        expect(myOrder.customerId).toEqual(orders[0].customerId);
        expect(yourOrder.uuid).toEqual(orders[1].uuid);
        expect(yourOrder.customerId).toEqual(orders[1].customerId);
    });

    /**
     * <pre>
     * GivenanemptyOrderKeeperWhenanlistis triggered
     * Then an empty array must be returned
     * </pre>
     */
    it('shouldn\'t return a orders', function() {
        // given

        // when
        var orders = OrderKeeper.list();

        // then
        expect(orders.length).toBe(0);
    });

});