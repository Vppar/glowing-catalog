describe('Service: OrderServiceHandleItem', function () {
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
      OrderService.clear();

      voucher0 = {qty : 1, price : 0, type : 'voucher'};
      voucher1 = {qty : 1, price : 1, type : 'voucher'};
      voucher2 = {qty : 1, price : 2, type : 'voucher'};
  }));


  describe('voucher handling', function () {
      var voucher0, voucher1, voucher2;

      beforeEach(inject(function(_OrderService_) {
          voucher0 = {qty : 1, price : 0, type : 'voucher'};
          voucher1 = {qty : 1, price : 1, type : 'voucher'};
          voucher2 = {qty : 1, price : 2, type : 'voucher'};
      }));


      it('adds voucher if there\'s no voucher in the order', function () {
          expect(OrderService.order.items.length).toBe(0);
          OrderService.handleItem(voucher1);
          expect(OrderService.order.items.length).toBe(1);
          expect(OrderService.order.items[0]).toBe(voucher1);
      });

      it('updates the voucher value if there\'s a voucher in the order and voucher has a price',
        function () {
            OrderService.handleItem(voucher1);
            expect(OrderService.order.items.length).toBe(1);
            expect(OrderService.order.items[0].price).toBe(1);

            OrderService.handleItem(voucher2);
            expect(OrderService.order.items.length).toBe(1);
            expect(OrderService.order.items[0].price).toBe(2);
        });

      it('removes the voucher from the order if there\'s a voucher in the order and the updated value is 0',
        function () {
            OrderService.handleItem(voucher1);
            expect(OrderService.order.items.length).toBe(1);
            expect(OrderService.order.items[0].price).toBe(1);

            OrderService.handleItem(voucher0);
            expect(OrderService.order.items.length).toBe(0);
        });
  }); // voucher handling


  describe('giftCard handling', function () {
      var gift0, gift1, gift2;

      beforeEach(inject(function(_OrderService_) {
          gift0 = {qty : 1, price : 0, type : 'giftCard'};
          gift1 = {qty : 1, price : 1, type : 'giftCard'};
          gift2 = {qty : 1, price : 2, type : 'giftCard'};
      }));


      it('adds the gift card if it has a price', function () {
          expect(OrderService.order.items.length).toBe(0);
          OrderService.handleItem(gift1);
          expect(OrderService.order.items.length).toBe(1);
          expect(OrderService.order.items[0]).toBe(gift1);
          OrderService.handleItem(gift2);
          expect(OrderService.order.items.length).toBe(2);
          expect(OrderService.order.items[1]).toBe(gift2);
      });

      it('does not add a gift card if gift card has no value', function () {
          expect(OrderService.order.items.length).toBe(0);
          OrderService.handleItem(gift0);
          expect(OrderService.order.items.length).toBe(0);
      });
  }); // giftCard handling


  describe('product handling', function () {
      var prod0, prod1, prod2a, prod2b;

      beforeEach(function () {
          prod0 = {qty : 0, price : 1, SKU : 'sku1'};
          prod1 = {qty : 1, price : 1, SKU : 'sku1'};

          // Same SKU, diff qty
          prod2a = {qty : 1, price : 2, SKU : 'sku2'};
          prod2b = {qty : 3, price : 2, SKU : 'sku2'};
      });


      it('adds the product to the order if the product is not in it',
        function () {
            expect(OrderService.order.items.length).toBe(0);
            OrderService.handleItem(prod1);
            expect(OrderService.order.items.length).toBe(1);
            expect(OrderService.order.items[0]).toBe(prod1);
        });

      it('updates product\'s quantity if product is already in the order',
        function () {
            OrderService.handleItem(prod2a);
            expect(OrderService.order.items[0].qty).toBe(1);
            OrderService.handleItem(prod2b);
            expect(OrderService.order.items[0].qty).toBe(3);
        });

      it('removes the product from the order if its quantity is set to 0',
        function () {
            OrderService.handleItem(prod1);
            expect(OrderService.order.items.length).toBe(1);
            OrderService.handleItem(prod0);
            expect(OrderService.order.items.length).toBe(0);
        });
  }); // product handling
});
