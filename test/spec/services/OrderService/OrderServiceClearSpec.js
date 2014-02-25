describe('Service: OrderServiceClear', function () {
  var fakeNow = 1386444467895;
  var logMock = {};
  var OrderMock = {};
  var OrderKeeperMock = {};
  var DataProviderMock = {};
  var IdentityServiceMock = {};

  var OrderService;

  // load the service's module
  beforeEach(function () {

    module('tnt.catalog.order.service');

    spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    logMock.debug = jasmine.createSpy('$log.debug');

    OrderKeeperMock.clear = jasmine.createSpy('OrderKeeper.save');

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
      $provide.value('IdentityService', IdentityServiceMock);
    });
  });

  beforeEach(inject(function(_OrderService_) {
    OrderService = _OrderService_;
  }));


  it('removes custom properties from the order', function () {
    OrderService.order.custom = 'foobar';
    OrderService.clear();
    expect(OrderService.order.custom).toBeUndefined();
  });


  it('resets the order to the contents from the template', function () {
    OrderService.order.customerId = 3;
    OrderService.order.canceled = true;

    OrderService.clear();
    
    expect(OrderService.order.customerId).toBeNull();
    expect(OrderService.order.canceled).toBe(false);
  });


  it('creates a new items list', function () {
    var oldItems = OrderService.order.items;
    OrderService.clear();
    expect(OrderService.order.items).not.toBe(oldItems);
  });


  it('keeps the same object (references and bindings do not break)', function () {
    var oldOrder = OrderService.order;
    OrderService.clear();
    expect(OrderService.order).toBe(oldOrder);
  });
});
