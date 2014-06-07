describe('Service: OrderServiceList', function () {
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

    DataProviderMock.customers = [
      {
        id : 1,
        name : 'Foo Bar'
      }
    ];

    OrderKeeperMock.list = jasmine.createSpy('OrderKeeper.list').andReturn('ok');

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
   * OrderService.list() works as a proxy to OrderKeeper.list(), just
   * adding some basic error handling. Therefore, it should just invoke
   * and return the OrderKeeper's results.
   */
  it('gets orders from OrderKeeper.list()', function () {
    var orders = OrderService.list();
    expect(OrderKeeperMock.list).toHaveBeenCalled();
    // Are we returning the value returned by 'OrderKeeper.list()'?
    expect(orders).toEqual('ok');
  });
it('gets orders from OrderKeeper.list return error.', function () {
	    OrderKeeperMock.list = jasmine.createSpy('OrderKeeper.list').andCallFake(function() {
            throw 'error';
        }); 
	  
	    OrderService.list();
	    
	    expect(OrderKeeperMock.list).toHaveBeenCalled();
	    expect(OrderKeeperMock.list).toThrow('error');
   });
});
