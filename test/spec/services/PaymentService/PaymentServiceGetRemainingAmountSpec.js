describe('Service: PaymentServiceGetRemainingAmount', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.service.coupon');
        module('tnt.catalog.filter.sum');
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

        PaymentService.add(new CashPayment(100));
    }));

    it('returns 0 if the given amount is lower than the payment total', function () {
      expect(PaymentService.getRemainingAmount(99)).toBe(0);
      expect(PaymentService.getRemainingAmount(50)).toBe(0);
      expect(PaymentService.getRemainingAmount(0)).toBe(0);
    });

    it('returns 0 if the given amount is equal than the payment total', function () {
      expect(PaymentService.getRemainingAmount(100)).toBe(0);
    });

    it('returns the difference between the given amount and the payment total otherwise', function () {
      expect(PaymentService.getRemainingAmount(101)).toBe(1);
      expect(PaymentService.getRemainingAmount(150)).toBe(50);
      expect(PaymentService.getRemainingAmount(200)).toBe(100);
    });

    it('works with floats', function () {
      expect(PaymentService.getRemainingAmount(100.01)).toEqual(0.01);
    });
});
