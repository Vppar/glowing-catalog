describe('Service: OrderServiceUpdate', function() {
    var fakeNow = 1386444467895;
    var OrderMock = {};
    var OrderKeeperMock = {};
    var DataProviderMock = {};
    var OrderKeeper = null;

    var OrderService = null;

    // load the service's module
    beforeEach(function() {

        module('tnt.catalog.order.service');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');

        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        OrderKeeperMock.update = jasmine.createSpy('OrderKeeper.update').andReturn('ok');

        module(function($provide) {
            $provide.value('DataProvider', DataProviderMock);
        });
    });

    beforeEach(inject(function(_OrderService_, _OrderKeeper_) {
        OrderService = _OrderService_;
        OrderKeeper = _OrderKeeper_;
    }));

    it('create new order with OrderKeeper.setCurrentOrder()', function() {

        OrderKeeper.handlers.nukeOrdersV1();

        var result = false;
        var length = OrderService.list().length + 1;

        OrderKeeperMock.register = jasmine.createSpy('OrderKeeper.register').andCallFake(function() {
            var deferred = $q.defer();

            setTimeout(function() {
                deferred.resolve('1');
            }, 0);

            return deferred.promise;
        });

        runs(function() {
            // when
            var orderPromise = OrderService.setCurrentOrder();
            orderPromise.then(function() {
                result = true;
            });
            scope.$apply();
        });

        waitsFor(function() {
            return result;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(OrderService.list().length).toBe(length);
        });

    });

    it('get current order with OrderKeeper.setCurrentOrder()', function() {

        OrderKeeper.order = [
            {
                status : 'current'
            }
        ];
        var length = OrderService.list().length;

        OrderService.setCurrentOrder();

        expect(OrderService.list().length).toBe(length);

    });

});
