describe('Service: OrderServiceUpdateOrderQty', function() {
    var fakeNow = 1386444467895;
    var logger = {};
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var scope = {};

  var OrderService;
  var scope = null;
  var result = null;
  var q = null;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        logger.info = jasmine.createSpy('logger.info');
        logger.getLogger = jasmine.createSpy('logger.getLogger').andReturn(logger);
        module(function($provide) {
            $provide.value('logger', logger);
            $provide.value('Order', OrderMock);
            $provide.value('OrderKeeper', OrderKeeperMock);
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_, $rootScope, _$q_) {
        OrderService = _OrderService_;
        scope = $rootScope;
        q = _$q_;
    }));

    it('', function() {
        PromiseHelper.config(q, angular.noop);
        OrderKeeperMock.updateItemQty = jasmine.createSpy('OrderKeeper.updateItemQty').andCallFake(PromiseHelper.resolved(true));

        runs(function() {

            // when
            OrderService.updateItemQty(1, [
                {
                    test : 'updated'
                }
            ]).then(function() {
                result = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return result;
        }, 'JournalKeeper is taking too long');

        runs(function() {
            expect(OrderKeeperMock.updateItemQty).toHaveBeenCalledWith(1, [
                {
                    test : 'updated'
                }
            ]);
        });

    });
});
