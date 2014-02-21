describe('Service: OrderServiceCancel', function() {
    var fakeNow = 1386444467895;
    var logMock = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var q = {};

    var OrderService;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        logMock.debug = jasmine.createSpy('$log.debug');

        module(function($provide) {
            $provide.value('$log', logMock);
            $provide.value('Order', OrderMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_, _$q_) {
        OrderService = _OrderService_;
        q = _$q_;
    }));

    /**
     * OrderService.cancel() works as a proxy to OrderKeeper.cancel(), just
     * adding some basic error handling. Therefore, it should just invoke and
     * return the OrderKeeper's results.
     */
    it('gets order from OrderKeeper.cancel()', function() {
        var order = null;

        OrderKeeperMock.cancel = jasmine.createSpy('OrderKeeper.cancel').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve();
            }, 0);

            return deferred.promise;
        });

        runs(function() {
            // when
            order = OrderService.cancel(1);
            order.then(function() {
                result = true;
            });
            scope.$apply();
        });

        waitsFor(function() {
            return result;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(OrderKeeperMock.cancel).toHaveBeenCalledWith(1);
        });

    });

});
