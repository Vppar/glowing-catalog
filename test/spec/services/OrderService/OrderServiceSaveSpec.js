describe('Service: OrderServiceSave', function() {
    var fakeNow = 1386444467895;
    var logMock = {};
	var loggerMock = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};

    var OrderService = {};

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        loggerMock.error = jasmine.createSpy('logger.error');
		loggerMock.getLogger = jasmine.createSpy('logMock.getLogger').andReturn(loggerMock);

        DataProviderMock.customers = [
            {
                id : 1,
                name : 'Foo Bar'
            }
        ];

        OrderKeeperMock.register = jasmine.createSpy('OrderKeeper.register');

        module(function($provide) {
            $provide.value('$log', logMock);
            $provide.value('Order', OrderMock);
            $provide.value('logger', loggerMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_) {
        OrderService = _OrderService_;
    }));
    
    it('save order successfully.', function() {      
    	
    	OrderService.order.items.push({
            qty : 1
        });
    	
    	OrderService.register = jasmine.createSpy('OrderService.register');
    	
        var order = OrderService.save();
        
        expect(OrderService.register).toHaveBeenCalled();
    });

    // FIXME - Uncomment this and make it work.
    xit('sets the order date', function() {
        expect(OrderService.order.date).toBeNull();
        var order = OrderService.save();
        expect(order.date).not.toBeNull();
        expect(order.date).toEqual(jasmine.any(Date));
    });

    // FIXME - Uncomment this and make it work.
    xit('returns the saved order', function() {
        var order = OrderService.save();
        expect(typeof order).toBe('object');
        expect(order.date).not.toBeNull();
        expect(order.items).not.toBeNull();
    });

    // FIXME - Uncomment this and make it work.
    xit('calls OrderService.register()', function() {
        OrderService.register = jasmine.createSpy('OrderService.register');
        var order = OrderService.save();
        expect(OrderService.register).toHaveBeenCalledWith(order);
    });

    // FIXME - Uncomment this and make it work.
    xit('removes items with no quantity', function() {
        OrderService.order.items.push({
            qty : 0
        });
        OrderService.order.items.push({
            qty : 1
        });

        expect(OrderService.order.items.length).toBe(2);
        var order = OrderService.save();
        expect(order.items.length).toBe(1);
    });
});
