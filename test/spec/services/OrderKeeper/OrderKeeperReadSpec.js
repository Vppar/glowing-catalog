'use strict';
describe('Service: CoinKeeperReadExpense', function() {

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
     * Given a existing expense id     
     * When an get is triggered
     * Then the target expense should be returned
     * </pre>
     */
    it('should return a expense', function() {
        // given
        var myOrder = {
            id : 1,
            code : 12,
            date : new Date(),
            customerId : 1,
            paymentIds : [],
            items : []
        };

        var yourOrder = {
            id : 3,
            code : 13,
            date : new Date(),
            customerId : 2,
            paymentIds : [],
            items : []
        };

        OrderKeeper.handlers['orderAddV1'](myOrder);
        OrderKeeper.handlers['orderAddV1'](yourOrder);

        // when
        var myResult = OrderKeeper.read(1);
        var yourResult = OrderKeeper.read(3);
        //Theres no order with id 2.
        var someoneResult = OrderKeeper.read(2);

        // then
        expect(myOrder).not.toBe(myResult);
        expect(yourOrder).not.toBe(yourResult);

        expect(myOrder.id).toBe(myResult.id);
        expect(yourOrder.id).toBe(yourResult.id);

        expect(someoneResult).toEqual(undefined);

    });

    /**
     * <pre>
     * Given a missing order id     
     * When an read is triggered
     * Then undefined should be returned
     * </pre>
     */
    it('shouldn\'t return a expense', function() {
        // given
        var myOrder = {
            id : 1,
            code : 12,
            date : new Date(),
            customerId : 1,
            paymentIds : [],
            items : []
        };
        OrderKeeper.handlers['orderAddV1'](myOrder);

        // when
        var myResult = OrderKeeper.read(123);

        // then
        expect(myResult).toBe(null);
    });

});
