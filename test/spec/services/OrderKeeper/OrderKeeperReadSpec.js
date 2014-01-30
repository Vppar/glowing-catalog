'use strict';
describe('Service: OrderKeeperReadSpec', function() {

    var OrderKeeper = null;
    var fakeNow = null;

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // instantiate service
    beforeEach(inject(function(_OrderKeeper_) {
        OrderKeeper = _OrderKeeper_;
    }));

    /**
     * <pre>
     * Givena existing expense id     
     * When an get is triggered
     * Then the target expense should be returned
     * </pre>
     */
    it('should return a order', function() {
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
        var myResult = OrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000001');
        var yourResult = OrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000002');
        // Theres no order with id 2.
        var someoneResult = OrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000003');

        // then
        expect(myOrder).not.toBe(myResult);
        expect(yourOrder).not.toBe(yourResult);

        expect(myOrder.uuid).toBe(myResult.uuid);
        expect(yourOrder.uuid).toBe(yourResult.uuid);

        expect(someoneResult).toEqual(undefined);

    });

    /**
     * <pre>
     * Givena missing order id     
     * When an read is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a order', function() {
        // given
        var myOrder = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            code : 12,
            date : new Date(),
            customerId : 1,
            items : []
        };
        OrderKeeper.handlers['orderAddV1'](myOrder);

        // when
        var myResult = OrderKeeper.read(123);

        // then
        expect(myResult).toBe(null);
    });

});
