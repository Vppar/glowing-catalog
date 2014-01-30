describe('Service: OrderServiceGetOrderTotal', function () {
  var fakeNow = 1386444467895;
  var monthTime = 2592000;

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

    DataProviderMock.customers = [
      {
        id : 1,
        name : 'Foo Bar'
      }
    ];

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_OrderService_) {
    OrderService = _OrderService_;

    // Reset the order
    OrderService.clear();
  }));


  it('sums the amount of all items', function () {
    OrderService.addItem({id : 1, qty : 1, price : 10});
    OrderService.addItem({id : 2, qty : 1, price : 20});
    OrderService.addItem({id : 3, qty : 1, price : 30});

    expect(OrderService.getOrderTotal()).toBe(60);
  });

  it('multiplies the price of a product by its quantity', function () {
    OrderService.addItem({id : 1, qty : 1, price : 10});
    OrderService.addItem({id : 2, qty : 2, price : 20});
    OrderService.addItem({id : 3, qty : 3, price : 30});

    expect(OrderService.getOrderTotal()).toBe(140);
  });

  it('returns 0 if order is empty', function () {
    expect(OrderService.order.items.length).toBe(0);
    expect(OrderService.getOrderTotal()).toBe(0);
  });
});
