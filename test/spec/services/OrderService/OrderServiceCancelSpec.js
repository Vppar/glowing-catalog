describe('Service: OrderServiceCancel', function () {
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

    OrderKeeperMock.cancel = jasmine.createSpy('OrderKeeper.cancel').andReturn('ok');

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


  /**
   * OrderService.cancel() works as a proxy to OrderKeeper.cancel(), just
   * adding some basic error handling. Therefore, it should just invoke
   * and return the OrderKeeper's results.
   */
  it('gets order from OrderKeeper.cancel()', function () {
    var order = OrderService.cancel(1);
    expect(OrderKeeperMock.cancel).toHaveBeenCalledWith(1);
    // Are we returning the value returned by 'OrderKeeper.cancel()'?
    expect(order).toEqual('ok');
  });
});
