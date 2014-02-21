describe('Service: OrderServiceUpdate', function () {
  var fakeNow = 1386444467895;
  var logMock = {};
  var OrderMock = {};
  var OrderKeeperMock = {};
  var DataProviderMock = {};

  var OrderService;

  // load the service's module
  beforeEach(function () {

    module('tnt.catalog.order.service');

    spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    logMock.debug = jasmine.createSpy('$log.debug');

    OrderKeeperMock.update = jasmine.createSpy('OrderKeeper.update').andReturn('ok');

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_OrderService_) {
    OrderService = _OrderService_;
  }));

  it('gets order from OrderKeeper.update()', function () {
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
        order = OrderService.update(1,[{test:'updated'}]);
        order.then(function() {
            result = true;
        });
        scope.$apply();
    });

    waitsFor(function() {
        return result;
    }, 'JournalKeeper is taking too long', 300);

    runs(function() {
        expect(OrderKeeperMock.update).toHaveBeenCalledWith(1,[{test:'updated'}]);
    });

  });
});
