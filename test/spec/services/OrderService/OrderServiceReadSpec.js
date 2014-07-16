describe('Service: OrderServiceRead', function () {
  var fakeNow = 1386444467895;
  var logMock = {};
  var loggerMock = {};
  var OrderMock = {};
  var OrderKeeperMock = {};
  var DataProviderMock = {};

  var OrderService;

  // load the service's module
  beforeEach(function () {

    module('tnt.catalog.order.service');

    spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    		loggerMock.debug = jasmine.createSpy('logger.debug');
		loggerMock.getLogger = jasmine.createSpy('logMock.getLogger').andReturn(loggerMock);

		OrderKeeperMock.read = jasmine.createSpy('OrderKeeper.read').andReturn(
				'ok');

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('logger', loggerMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_OrderService_) {
    OrderService = _OrderService_;
  }));


  /**
   * OrderService.read() works as a proxy to OrderKeeper.read(), just
   * adding some basic error handling. Therefore, it should just invoke
   * and return the OrderKeeper's results.
   */
  it('gets order from OrderKeeper.read()', function () {
    var order = OrderService.read(1);
    expect(OrderKeeperMock.read).toHaveBeenCalledWith(1);
    // Are we returning the value returned by 'OrderKeeper.read()'?
    expect(order).toEqual('ok');
  });
it('gets order from OrderKeeper.read return error', function() {

		OrderKeeperMock.read = jasmine.createSpy('OrderKeeper.read')
				.andCallFake(function() {
					throw 'error';
				});

		OrderService.read(1);
		expect(OrderKeeperMock.read).toHaveBeenCalledWith(1);
		expect(OrderKeeperMock.read).toThrow('error');
	});
});
