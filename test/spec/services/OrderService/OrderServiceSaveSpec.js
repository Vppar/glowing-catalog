describe('Service: OrderServiceSave', function () {
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

    OrderKeeperMock.register = jasmine.createSpy('OrderKeeper.register');
    OrderKeeperMock.save = jasmine.createSpy('OrderKeeper.save');

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


  it('sets the order date', function () {
    expect(OrderService.order.date).toBeNull();
    var order = OrderService.save();
    expect(order.date).not.toBeNull();
    expect(order.date).toEqual(jasmine.any(Date));
  });


  it('returns the saved order', function () {
    var order = OrderService.save();
    expect(typeof order).toBe('object');
    expect(order.date).not.toBeNull();
    expect(order.items).not.toBeNull();
  });

  it('calls OrderService.register()', function () {
    OrderService.register = jasmine.createSpy('OrderService.register');
    var order = OrderService.save();
    expect(OrderService.register).toHaveBeenCalledWith(order);
  });

  it('removes items with no quantity', function () {
    OrderService.order.items.push({qty : 0});
    OrderService.order.items.push({qty : 1});

    expect(OrderService.order.items.length).toBe(2);
    var order = OrderService.save();
    expect(order.items.length).toBe(1);
  });
});
