'use strict';

describe('Service: OrderKeeper.add(Order)', function() {

    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
    });

    var OrderKeeper = undefined;
    var Order = undefined;

    beforeEach(inject(function(_OrderKeeper_, _Order_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
    }));

    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a valid Order
     * when create is triggered
     * then a order must be created
     * and the entry must be registered
     * </pre>
     */
    it('should add a order', function() {
        runs(function() {
            var id = 1;
            var code = '123';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];

            var ev = new Order(id, code, canceled, date, customerId, items);
            OrderKeeper.add(ev);
        });

        waitsFor(function() {
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(OrderKeeper.list().length).toBe(1);
            expect(OrderKeeper.list()[0].code).toBe('123');

        });
    });

    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a invalid Order
     * when create is triggered
     * then a order must not be created
     * and the entry must not be registered
     * </pre>
     */
    xit('should not add a order', function() {
        runs(function() {
            var od = {
                id : 1,
                code : '123',
                customerId : 2
            };
            
            expect(OrderKeeper.add(od)).toThrow();
        });

        /*waitsFor(function() {
            return OrderKeeper.list();
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function() {
            
             expect(OrderKeeper.list().length).toBe(1);
             expect(OrderKeeper.list()[0].code).toBe('123');
             
        });*/
    });
});
