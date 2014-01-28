'use strict';

describe('Service: OrderKeeper.cancel', function() {

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
     * @spec OrderKeeper.cancel#1
     * Given a populated list of orders
     * when and cancel is triggered
     * then a order must be canceled - canceled means the field will have a canceling Date 
     * </pre>
     */
    it('should cancel', function() {

        runs(function(){
            //then
            var code = '123';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            
            OrderKeeper.handlers.orderAddV1(new Order(1, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(2, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(3, code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order(4, code,canceled, date, customerId, items));

            //when
            OrderKeeper.cancel(2);
        });
        
        waitsFor(function(){
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            //then
            var order = ArrayUtils.find(OrderKeeper.list(), 'id', 2);
            expect(order.canceled instanceof Date).toBe(true);
        });
    });
    
    
    /**
     * <pre>
     * @spec OrderKeeper.cancel#1
     * Given a invalid order
     * given a populated list of orders
     * when and cancel is triggered
     * Then a exception must be throw
     * </pre>
     */
    it('should throw an exception', function() {
        //given
        var code = '123';
        var date = new Date();
        var canceled = false;
        var customerId = 2;
        var items = [];

        OrderKeeper.handlers.orderAddV1(new Order(1, code, canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(2, code, canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(3, code, canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(4, code, canceled, date, customerId, items));
        
        //when
        var createCall = function() {
            OrderKeeper.cancel(5);
        };
        
        //then
        expect(createCall).toThrow('Unable to find an order with id=\'5\'');
    });
    
    
});
