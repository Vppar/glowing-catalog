describe('Service: PaymentServiceClearAll', function() {

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


    it('should reset the payment array for all payment types', function () {
      spyOn(PaymentService, 'clear');

      PaymentService.add(new CouponPayment(100));
      PaymentService.add(new CheckPayment(1000, 100, 123, 12345, 1232, new Date()));

      expect(PaymentService.list('coupon').length).toBe(1);
      expect(PaymentService.list('check').length).toBe(1);

      PaymentService.clearAll();

      expect(PaymentService.list('coupon').length).toBe(0);
      expect(PaymentService.list('check').length).toBe(0);
    });

});
