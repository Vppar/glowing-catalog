describe('Service: OrderServiceRegisterSpec', function() {
    var fakeNow = 1386444467895;
    var loggerMock = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var $rootScope = {};
    var OrderService = null;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        loggerMock.info = jasmine.createSpy('logger.info');
        loggerMock.error = jasmine.createSpy('logger.error');
        loggerMock.getLogger = jasmine.createSpy('logger.getLogger').andReturn(loggerMock);

        DataProviderMock.customers = [
            {
                id : 1,
                name : 'Foo Bar'
            }
        ];

        OrderKeeperMock.add = jasmine.createSpy('OrderKeeper.add');

        module(function($provide) {
            $provide.value('logger', loggerMock);
            $provide.value('Order', OrderMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_, _$rootScope_) {
        OrderService = _OrderService_;
        $rootScope = _$rootScope_;
    }));

    // FIXME - This test doesn't test anything, rebuild it
    xit('calls OrderKeeper.add() if order is valid', function() {
        var validOrder = {
            date : new Date(),
            canceled : false,
            customerId : 1,
            items : [
                {}
            ]
        };

        var result = OrderService.register(validOrder);
        expect(OrderKeeperMock.add).toHaveBeenCalledWith(validOrder);
    });

    // FIXME - This test doesn't test anything, rebuild it
    xit('does not call OrderKeeper.add() if order is invalid', function() {
        var invalidOrder = {
            date : new Date(),
            canceled : false,
            customerId : 1,
            items : []
        };

        var result = OrderService.register(invalidOrder);
        expect(OrderKeeperMock.add).not.toHaveBeenCalled();
    });

    it('returns the validation result', function() {
        var invalidOrder = {
            date : new Date(),
            canceled : false,
            customerId : 1,
            items : []
        };

        var resolution = null;
        runs(function() {
            var promise = OrderService.register(invalidOrder);

            promise.then(null, function(_resolution_) {
                resolution = _resolution_;
            });
        });

        waitsFor(function() {
            $rootScope.$apply();
            return !!resolution;
        });

        runs(function() {
            expect(resolution.length).toBe(1);
            expect(resolution[0]).toEqual({items:[]}); // order.items cannot be empty
        });
    });
});
