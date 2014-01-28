describe('Service: OrderService', function () {
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

  it('initializes an order object', function () {
    expect(OrderService.order).not.toBeUndefined();
    expect(typeof OrderService.order).toBe('object');
    expect(OrderService.order.customerId).not.toBeUndefined();
  });

  it('sets a new items array in the order object', function () {
    expect(OrderService.order.items).not.toBeUndefined();
    expect(OrderService.order.items).toEqual([]);
  });
});
