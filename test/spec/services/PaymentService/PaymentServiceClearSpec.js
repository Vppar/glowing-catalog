describe('Service: PaymentServiceClear', function() {

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

    it('removes payments for the given payment type', function () {
      PaymentService.add(new CouponPayment(100));
      PaymentService.add(new CashPayment(100));
      PaymentService.add(new CheckPayment(123, 123, 123, 123, 123, new Date()));
      PaymentService.add(new CreditCardPayment(123, 'VISA', 123123123123, 'FOO', new Date(), 123, '1231231321', 2));
      PaymentService.add(new ExchangePayment(1, 1, 62));
      PaymentService.add(new OnCuffPayment(123, new Date()));

      expect(PaymentService.list('coupon').length).toBe(1);
      PaymentService.clear('coupon');
      expect(PaymentService.list('coupon').length).toBe(0);

      expect(PaymentService.list('cash').length).toBe(1);
      PaymentService.clear('cash');
      expect(PaymentService.list('cash').length).toBe(0);

      expect(PaymentService.list('check').length).toBe(1);
      PaymentService.clear('check');
      expect(PaymentService.list('check').length).toBe(0);

      expect(PaymentService.list('creditCard').length).toBe(1);
      PaymentService.clear('creditCard');
      expect(PaymentService.list('creditCard').length).toBe(0);

      expect(PaymentService.list('exchange').length).toBe(1);
      PaymentService.clear('exchange');
      expect(PaymentService.list('exchange').length).toBe(0);

      expect(PaymentService.list('onCuff').length).toBe(1);
      PaymentService.clear('onCuff');
      expect(PaymentService.list('onCuff').length).toBe(0);
    });

    it('throws an error for invalid payment types', function () {
      expect(function () {
        PaymentService.clear('invalidPaymentType');
      }).toThrow('PaymentService.clear: invalid payment type');
    });


    describe('PaymentService.clear event', function () {
      var rootScope;

      beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
      }));

      it('is triggered when clearing payments for a given type',
        function () {
          var listener = jasmine.createSpy('listener');

          rootScope.$on('PaymentService.clear', listener);

          PaymentService.add(new CashPayment(1));
          PaymentService.clear('cash');

          expect(listener).toHaveBeenCalled();
        });

      it('is not triggered when there are no payments to be removed',
        function () {
          var listener = jasmine.createSpy('listener');

          rootScope.$on('PaymentService.clear', listener);

          PaymentService.clear('cash');

          expect(listener).not.toHaveBeenCalled();
        });

      it('is not triggered when clearing an invalid payment type',
        function () {
          var listener = jasmine.createSpy('listener');

          rootScope.$on('PaymentService.clear', listener);

          try {
            PaymentService.clear('cash');
          } catch (err) {
            expect(err.message).toBe('PaymentService.clear: invalid payment type');
          }

          expect(listener).not.toHaveBeenCalled();
        });

      it('passes the cleared type and the array of removed payments to the listener',
        function () {
          var
            listener = jasmine.createSpy('listener'),
            payment = new CashPayment(1);

          rootScope.$on('PaymentService.clear', listener);

          PaymentService.add(payment);
          PaymentService.clear('cash');

          expect(listener).toHaveBeenCalled();

          var call = listener.calls[0];
          expect(call.args[1]).toBe('cash');
          expect(call.args[2]).toEqual([payment]);
        });
    });
});
