'use strict';

describe('Service: OrderKeeperReadScenario', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
    });
    
    // instantiate service
    var OrderKeeper = undefined;
    var Order = undefined;
    
    beforeEach(inject(function(_OrderKeeper_, _Order_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
    }));
    
    /**
     * <pre>
     * @spec OrderKeeper.read#1
     * Given a populated list
     * And a valid id
     * when and read is triggered
     * then a an order must be returned
     * </pre>
     */
    it('should return a Order', function() {
            //given
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', '123',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', '1234',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', '12345',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', '123456',canceled, date, customerId, items));
        
        
            //when
            expect(OrderKeeper.read('cc02b600-5d0b-11e3-96c3-010001000002').code).toBe('1234');
    });
    
    
    
    /**
     * <pre>
     * @spec OrderKeeper.read#1
     * Given a populated list
     * And a invalid id
     * when and read is triggered
     * then a an null object must be returned
     * </pre>
     */
    it('should not return a Order', function() {
        runs(function(){
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', '123',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', '1234',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', '12345',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', '123456',canceled, date, customerId, items));
        });
        
        waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(OrderKeeper.read(6)).toBe(null);
        });
    });
    
    
});
