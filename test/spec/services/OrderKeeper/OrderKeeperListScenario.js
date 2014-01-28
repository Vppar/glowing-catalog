'use strict';

describe('Service: OrderKeepe.list', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
    });
    
    // instantiate service
    var OrderKeeper = undefined;
    var Order = undefined;
    var myNewList = undefined;
    
    beforeEach(inject(function(_OrderKeeper_, _Order_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
    }));
       
    
    /**
     * <pre>
     * @spec OrderKeeper.list#1
     * Given a empty list
     * when and list is triggered
     * then a list must be empty
     * </pre>
     */
    it('should return list with 0 items', function() {
        //given
        
        //when 
        
        //then
        expect(OrderKeeper.list().length).toBe(0);
        
    });
       
    /**
     * <pre>
     * @spec OrderKeeper.list#1
     * Given a populated list
     * when and list is triggered
     * then a list must be returned
     * </pre>
     */
    it('should return populated list with 4 items', function() {
        //given
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
        myNewList = OrderKeeper.list();

        //then
        expect(myNewList.length).toBe(4);
    });
    
    /**
     * <pre>
     * @spec OrderKeeper.list#1
     * Given a populated list
     * when and list is triggered
     * then a list must be returned
     * </pre>
     */
    it('should return populated list with 6 items', function() {
        //given
        var code = '123';
        var date = new Date();
        var canceled = false;
        var customerId = 2;
        var items = [];
        
        OrderKeeper.handlers.orderAddV1(new Order(1, code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(2, code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(3, code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(4, code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(5, code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order(6, code,canceled, date, customerId, items));
    
        //when
        myNewList = OrderKeeper.list();
        //then
        expect(myNewList.length).toBe(6);
    });
    
});
