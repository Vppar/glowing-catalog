describe('Service: OrderServiceRead', function () {
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

    OrderKeeperMock.read = jasmine.createSpy('OrderKeeper.read');

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_OrderService2_) {
    OrderService = _OrderService2_;
  }));


  /**
   * OrderService.read() works as a proxy to OrderKeeper.read(), just
   * adding some basic error handling. Therefore, it should just invoke
   * and return the OrderKeeper's results.
   */
  it('gets order from OrderKeeper.read()', function () {
    var order = OrderService.read(1);
    expect(OrderKeeperMock.read).toHaveBeenCalledWith(1);
    expect(order).toEqual(OrderKeeperMock.read(1));
  });
});
