'use strict';

describe('Service: OrderKeeper.cancel(id)', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        
    });
    
    // instantiate service
    var OrderKeeper = undefined;
    var Order = undefined;
    var ArrayUtils = undefined;
    
    beforeEach(inject(function(_OrderKeeper_, _Order_, _ArrayUtils_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
        ArrayUtils = _ArrayUtils_;
    }));
    
    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a order must be created
     * an the entry must be registered
     * </pre>
     */
    it('should cancel', function() {
        runs(function(){
            var code = '123';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order(1, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(2, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(3, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(4, code,canceled, date, customerId, items));
            
            OrderKeeper.cancel(2);
        });
        
        waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            var order = ArrayUtils.find(OrderKeeper.list(), 'id', 2);
            expect(order.canceled instanceof Date).toBe(true);
        });
    });
    
    
    //FIX broken test check this behavior.
    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a order must be created
     * an the entry must be registered
     * </pre>
     */
    xit('should not cancel', function() {
        runs(function(){
            var code = '123';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order(1, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(2, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(3, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(4, code,canceled, date, customerId, items));
            
            expect(OrderKeeper.cancel(5)).toThrow();
            
        });
        
       /* waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(Order.cancel).toThrow();
        });*/
    });
    
    
});
