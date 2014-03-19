describe('Service: OrderServiceIsValid', function () {
  var fakeNow = 1386444467895;
  var monthTime = 2592000;

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
    logMock.debug = jasmine.createSpy('$log.debug');
    loggerMock.getLogger = jasmine.createSpy('logger.getLogger');

    DataProviderMock.customers = [
      {
        id : 1,
        name : 'Foo Bar'
      }
    ];

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
    OrderService.order.items.length = 0;
  }));


  it('returns true if order has items', function () {
      OrderService.order.items.push({id: 1, qty : 1, price : 2});
      expect(OrderService.hasItems()).toBe(true);
  });

  it('returns false if order has no items', function () {
      expect(OrderService.hasItems()).toBe(false);
  });
});
