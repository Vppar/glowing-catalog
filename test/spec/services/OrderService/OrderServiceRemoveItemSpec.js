describe('Service: OrderServiceRemoveItem', function () {
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

    OrderKeeperMock.clear = jasmine.createSpy('OrderKeeper.save');

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

  var
    item1 = {id : 1, qty : 1, price : 1},
    item2 = {id : 2, qty : 2, price : 2},
    item3 = {id : 3, qty : 3, price : 3};

  beforeEach(function () {
    OrderService.clear();
    OrderService.addItem(item1);
    OrderService.addItem(item2);
    OrderService.addItem(item3);
  });

  it('removes the item at the given index', function () {
    expect(OrderService.order.items.length).toBe(3);
    OrderService.removeItem(1);
    expect(OrderService.order.items.length).toBe(2);
    expect(OrderService.order.items[1]).not.toBe(item2);
  });

  it('does nothing if there\'s no item at the given index', function () {
    expect(OrderService.order.items.length).toBe(3);

    expect(function () {
      OrderService.removeItem(123);
    }).not.toThrow();

    expect(OrderService.order.items.length).toBe(3);
  });

  it('does nothing if called with no index', function () {
    expect(OrderService.order.items.length).toBe(3);

    expect(function () {
      OrderService.removeItem();
    }).not.toThrow();

    expect(OrderService.order.items.length).toBe(3);
  });

  it('works with index 0', function () {
    expect(OrderService.order.items.length).toBe(3);
    OrderService.removeItem(0);
    expect(OrderService.order.items.length).toBe(2);
    expect(OrderService.order.items[0]).not.toBe(item1);
  });

  describe('OrderService.removeItem event', function () {
    var rootScope;

    beforeEach(inject(function ($rootScope) {
      rootScope = $rootScope;
    }));

    it('is triggered when an item is removed', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.removeItem', listener);
      OrderService.removeItem(0);
      expect(listener).toHaveBeenCalled();
    });

    it('is not triggered if there\'s no item at the given index', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.removeItem', listener);
      OrderService.removeItem(8);
      expect(listener).not.toHaveBeenCalled();
    });

    it('is not triggered if removeItem() is called without index', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.removeItem', listener);
      OrderService.removeItem();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
