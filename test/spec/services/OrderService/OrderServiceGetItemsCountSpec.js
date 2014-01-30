describe('Service: OrderServiceGetItemsCount', function () {
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

  var
    item1 = {id : 1, qty : 1, price : 1},
    item2 = {id : 2, qty : 2, price : 2},
    item3 = {id : 3, qty : 3, price : 3};

  it('gets the length of the items array', function () {
    OrderService.addItem(item1);
    OrderService.addItem(item2);
    OrderService.addItem(item3);

    expect(OrderService.getItemsCount()).toBe(3);
  });

  it('returns 0 if order is empty', function () {
    expect(OrderService.getItemsCount()).toBe(0);
  });

  // This is already tested in the first test, but just to make it clear.
  it('does not accounts for item\'s quantity', function () {
    OrderService.addItem(item1);
    OrderService.addItem(item2);
    OrderService.addItem(item3);

    expect(OrderService.getItemsCount()).toBe(3);
  });
});
