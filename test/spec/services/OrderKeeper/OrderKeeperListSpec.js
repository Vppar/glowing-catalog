'use strict';

describe('Service: OrderKeeperListExpense', function() {

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
     * Givena filled OrderKeeper     
     * When list is triggered
     * Then the target order should be returned
     * </pre>
     */
    it('should return a list of orders', function() {
        // given
        var myOrder = {
            id : 1,
            code : 12,
            date : new Date(),
            customerId : 1,
            items : []
        };

        var yourOrder = {
            id : 2,
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
        expect(myOrder.id).toEqual(orders[0].id);
        expect(myOrder.customerId).toEqual(orders[0].customerId);
        expect(yourOrder.id).toEqual(orders[1].id);
        expect(yourOrder.customerId).toEqual(orders[1].customerId);
    });

    /**
     * <pre>
     * Givenanempty OrderKeeper    
     * When an list is triggered
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