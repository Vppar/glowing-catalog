describe('Service: OrderServiceRegister', function () {
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

    DataProviderMock.customers = [
      {
        id : 1,
        name : 'Foo Bar'
      }
    ];

    OrderKeeperMock.add = jasmine.createSpy('OrderKeeper.add');

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

  it('calls OrderKeeper.add() if order is valid', function () {
    var validOrder = {
      date : new Date(),
      canceled : false,
      customerId : 1,
      items : [{}]
    };

    var result = OrderService.register(validOrder);
    expect(OrderKeeperMock.add).toHaveBeenCalledWith(validOrder);
  });

  it('does not call OrderKeeper.add() if order is invalid', function () {
    var invalidOrder = {
      date : new Date(),
      canceled : false,
      customerId : 1,
      items : []
    };

    var result = OrderService.register(invalidOrder);
    expect(OrderKeeperMock.add).not.toHaveBeenCalled();
  });

  it('returns the validation result', function () {
    var invalidOrder = {
      date : new Date(),
      canceled : false,
      customerId : 1,
      items : []
    };

    var result = OrderService.register(invalidOrder);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual([]); // order.items cannot be empty
  });
});
