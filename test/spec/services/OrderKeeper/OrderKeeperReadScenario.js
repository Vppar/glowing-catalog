'use strict';

describe('Service: OrderKeepe.read()', function() {

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
        runs(function(){
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order(1, '123',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(2, '1234',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(3, '12345',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(4, '123456',canceled, date, customerId, items));
        });
        
        waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(OrderKeeper.read(2).code).toBe('1234');
        });
    });
    
    
    
    //FIXME check this behavior.
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
            
            OrderKeeper.handlers.orderAddV1(new Order(1, '123',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(2, '1234',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(3, '12345',canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(4, '123456',canceled, date, customerId, items));
        });
        
        waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            //FIXME - Should throw exception or return null?
            expect(OrderKeeper.read(6)).toBe(null);
        });
    });
    
    
});
