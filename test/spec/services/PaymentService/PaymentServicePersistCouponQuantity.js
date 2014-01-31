describe('Service: PaymentServicePersistCouponQuantity', function() {


    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.service.coupon');
    });

    // instantiate service
    beforeEach(inject(function(_Payment_, _CashPayment_, _CheckPayment_, _CreditCardPayment_, _ExchangePayment_, _CouponPayment_,
            _CouponService_, _OnCuffPayment_, _PaymentService_) {
        Payment = _Payment_;
        CashPayment = _CashPayment_;
        CheckPayment = _CheckPayment_;
        CreditCardPayment = _CreditCardPayment_;
        ExchangePayment = _ExchangePayment_;
        CouponPayment = _CouponPayment_;
        CouponService = _CouponService_;
        OnCuffPayment = _OnCuffPayment_;
        PaymentService = _PaymentService_;
    }));

    it('sets the quantity of coupons of a given amount', function () {
      var
        amount = 10,
        qty = 5;

      PaymentService.persistCouponQuantity(amount, qty);
      expect(PaymentService.persistedCoupons[10]).toBe(5);
    });

    it('removes entry from persistedCoupons if qty is set to 0', function () {
      PaymentService.persistCouponQuantity(10, 5);
      expect(PaymentService.persistedCoupons).toEqual({10 : 5});
      PaymentService.persistCouponQuantity(10, 0);
      expect(PaymentService.persistedCoupons).toEqual({});
      expect(PaymentService.persistedCoupons).not.toEqual({10 : 0});
    });

    xit('calls PaymentService.removePersistedCoupons() when quantity is set to 0',
      function () {
        spyOn(PaymentService, 'removePersistedCoupons');

        PaymentService.persistCouponQuantity(10, 3);
        expect(PaymentService.removePersistedCoupons).not.toHaveBeenCalled();

        PaymentService.persistCouponQuantity(10, 0);
        expect(PaymentService.removePersistedCoupons).toHaveBeenCalled();
      });

    describe('PaymentService.persistCouponQuantity event', function () {
      var rootScope;

      beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        PaymentService.removePersistedCoupons();
      }));

      it('is triggered when amount is changed', function () {
        var listener = jasmine.createSpy('listener');
        rootScope.$on('PaymentService.persistCouponQuantity', listener);
        PaymentService.persistCouponQuantity(10, 3);
        expect(listener).toHaveBeenCalled();
      });

      it('is not triggered if amount is not changed', function () {
        var listener = jasmine.createSpy('listener');

        // Make sure there are no coupons before listening to the event
        PaymentService.removePersistedCoupons(10);

        rootScope.$on('PaymentService.persistCouponQuantity', listener);
        expect(listener).not.toHaveBeenCalled();

        PaymentService.persistCouponQuantity(10, 3);
        expect(listener.calls.length).toBe(1);
        PaymentService.persistCouponQuantity(10, 3);
        expect(listener.calls.length).toBe(1);
      });

      it('is triggered after PaymentService.removePersistedCoupons event when amount is set to 0',
        function () {
          var
            listener1 = jasmine.createSpy('listener1'),
            listener2 = jasmine.createSpy('listener2').andCallFake(function () {
              // Check that listener one was already called
              expect(listener1).toHaveBeenCalled();
            });;

          PaymentService.persistCouponQuantity(10, 3);

          // Listen after setting an initial value
          rootScope.$on('PaymentService.removePersistedCoupons', listener1);
          rootScope.$on('PaymentService.persistCouponQuantity', listener2);

          PaymentService.persistCouponQuantity(10, 0);
          expect(listener2).toHaveBeenCalled();
        });
   });
});
