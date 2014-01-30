'use strict';

describe('Service: OrderKeeperListScenario', function() {

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
        
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', code,canceled, date, customerId, items));

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
        
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000005', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000006', code,canceled, date, customerId, items));
    
        //when
        myNewList = OrderKeeper.list();
        //then
        expect(myNewList.length).toBe(6);
    });
    
});
