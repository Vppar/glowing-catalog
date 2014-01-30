describe('Service: OrderServiceAddItem', function () {
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

  beforeEach(function () {
    OrderService.clear();
  });

  it('adds an item to the order', function () {
    expect(OrderService.order.items.length).toBe(0);

    OrderService.addItem({
      id : 5,
      qty : 3,
      price : 10
    });

    expect(OrderService.order.items.length).toBe(1);
  });

  it('preserves the order in which the items are added', function () {
    expect(OrderService.order.items.length).toBe(0);

    var
      item1 = {id : 1, qty : 1, price : 1},
      item2 = {id : 2, qty : 2, price : 2},
      item3 = {id : 3, qty : 3, price : 3};

    OrderService.addItem(item1);
    OrderService.addItem(item2);
    OrderService.addItem(item3);

    expect(OrderService.order.items[0]).toBe(item1);
    expect(OrderService.order.items[1]).toBe(item2);
    expect(OrderService.order.items[2]).toBe(item3);
  });

  it('throws if item is not an object', function () {
    expect(function () {
      OrderService.addItem('foo');
    }).toThrow('OrderService.addItem: Invalid item');
  });

  it('throws if no item is given', function () {
    expect(function () {
      OrderService.addItem();
    }).toThrow('OrderService.addItem: Invalid item');
  });

  describe('OrderService.addItem', function () {
    var rootScope;

    beforeEach(inject(function ($rootScope) {
      rootScope = $rootScope;
    }));

    it('triggers when an item is inserted', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.addItem', listener);
      OrderService.addItem({id : 1, qty : 1, price : 1});
      expect(listener).toHaveBeenCalled();
    });

    it('is not triggered if addItem is called with no arguments', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.addItem', listener);

      try {
        OrderService.addItem();
      } catch (err) {
        expect(err).toBe('OrderService.addItem: Invalid item');
      }

      expect(listener).not.toHaveBeenCalled();
    });

    it('is not triggered if item is not an object', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.addItem', listener);

      try {
        OrderService.addItem('foo');
      } catch (err) {
        expect(err).toBe('OrderService.addItem: Invalid item');
      }

      expect(listener).not.toHaveBeenCalled();
    });

    it('passes the inserted item and its index in the order to the listener',
      function () {
        var
          listener = jasmine.createSpy('listener'),
          item1 = {id : 1, qty : 1, price : 1},
          item2 = {id : 2, qty : 2, price : 2},
          call;

        rootScope.$on('OrderService.addItem', listener);

        OrderService.addItem(item1);
        OrderService.addItem(item2);

        expect(listener.calls.length).toBe(2);

        call = listener.calls[0];
        expect(call.args[1]).toBe(item1);
        expect(call.args[2]).toBe(0);

        call = listener.calls[1];
        expect(call.args[1]).toBe(item2);
        expect(call.args[2]).toBe(1);
      });
  });

});
