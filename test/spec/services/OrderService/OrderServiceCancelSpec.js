describe('Service: OrderServiceCancel', function() {
    var fakeNow = 1386444467895;
    var logMock = {};
    var loggerMock = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var q = {};
    var result = null;
    var scope = null;

    var OrderService = {};

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');
        
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        logMock.debug = jasmine.createSpy('$log.debug');

        loggerMock.getLogger = jasmine.createSpy('loggerMock.getLogger');
        
        module(function($provide) {
            $provide.value('$log', logMock);
            $provide.value('logger', loggerMock);
            $provide.value('Order', OrderMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_, _$q_, $rootScope) {
        OrderService = _OrderService_;
        q = _$q_;
        scope = $rootScope;
    }));

    /**
     * OrderService.cancel() works as a proxy to OrderKeeper.cancel(), just
     * adding some basic error handling. Therefore, it should just invoke and
     * return the OrderKeeper's results.
     */
    it('gets order from OrderKeeper.cancel()', function() {
        var order = null;
        
        PromiseHelper.config(q, angular.noop);
        OrderKeeperMock.cancel = jasmine.createSpy('OrderKeeper.cancel').andCallFake(PromiseHelper.resolved(true));

        runs(function() {
            // when
            order = OrderService.cancel(1);
            order.then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        }, 'JournalKeeper is taking too long');

        runs(function() {
            expect(OrderKeeperMock.cancel).toHaveBeenCalledWith(1);
        });

    });

});
