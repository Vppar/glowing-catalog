describe('Service: OrderServiceUpdateItem', function () {
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


  it('updates the item at the given index with given data', function () {
    OrderService.addItem({id : 1, qty : 1, price : 1});
    OrderService.updateItem(0, {qty : 3});
    expect(OrderService.order.items[0].qty).toBe(3);
  });

  it('works with 0 index', function () {
    OrderService.addItem({id : 1, qty : 1, price : 1});
    OrderService.updateItem(0, {qty : 3});
    expect(OrderService.order.items[0].qty).toBe(3);
  });

  it('does not interfere with other indexes', function () {
    OrderService.addItem({id : 1, qty : 1, price : 1});
    OrderService.addItem({id : 2, qty : 2, price : 2});
    OrderService.updateItem(0, {qty : 3});
    // Keeps original qty at other indexes
    expect(OrderService.order.items[1].qty).toBe(2);
  });

  it('throws if index is not valid', function () {
    expect(function () {
      OrderService.updateItem('foo', {qty : 3});
    }).toThrow('OrderService.updateItem: Invalid index');
  });

  it('throws if no data is given', function () {
    OrderService.addItem({id : 1, qty : 1, price : 1});

    expect(function () {
      OrderService.updateItem(0);
    }).toThrow('OrderService.updateItem: Invalid update values');
  });

  it('throws if no index is given', function () {
    expect(function () {
      OrderService.updateItem(null, {qty : 3});
    }).toThrow('OrderService.updateItem: Invalid index');
  });

  describe('OrderService.updateItem event', function () {
    var rootScope;

    beforeEach(inject(function ($rootScope) {
      rootScope = $rootScope;
    }));

    it('triggers when an item is updated', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.updateItem', listener);

      OrderService.addItem({id : 1, qty : 1, price : 1});
      OrderService.updateItem(0, {qty : 3});

      expect(listener).toHaveBeenCalled();
    });

    it('is not triggered when the item is updated with itself', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.updateItem', listener);

      var item = {id : 1, qty : 1, price : 1};
      OrderService.addItem(item);
      OrderService.updateItem(0, item);

      expect(listener).not.toHaveBeenCalled();
    });

    it('is not triggered when the item is replaced with an equivalent item',
      function () {
        var listener = jasmine.createSpy('listener');
        rootScope.$on('OrderService.updateItem', listener);

        var
          item = {id : 1, qty : 1, price : 1},
          equivalent = angular.copy(item);

        OrderService.addItem(item);
        OrderService.updateItem(0, equivalent);

        expect(listener).not.toHaveBeenCalled();
      });

    it('is not triggered when updateItem() is called without idx', function () {
      var listener = jasmine.createSpy('listener');
      rootScope.$on('OrderService.updateItem', listener);

      var item = {id : 1, qty : 1, price : 1};
      OrderService.addItem(item);

      try {
        OrderService.updateItem(null, {qty : 3});
      } catch (err) {
        expect(err).toBe('OrderService.updateItem: Invalid index');
      }

      expect(listener).not.toHaveBeenCalled();
    });

    it('is not triggered when updateItem() is called without item',
      function () {
        var listener = jasmine.createSpy('listener');
        rootScope.$on('OrderService.updateItem', listener);

        var item = {id : 1, qty : 1, price : 1};
        OrderService.addItem(item);

        try {
          OrderService.updateItem(0, null);
        } catch (err) {
          expect(err).toBe('OrderService.updateItem: Invalid update values');
        }

        expect(listener).not.toHaveBeenCalled();
      });
  });
});
