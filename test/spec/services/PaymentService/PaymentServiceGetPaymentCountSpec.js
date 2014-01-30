describe('Service: PaymentServiceGetPaymentCount', function() {

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
    }));


    it('returns 0 if there are no payments', function () {
      expect(PaymentService.getPaymentCount()).toBe(0);
      expect(PaymentService.getPaymentCount('cash')).toBe(0);
    });

    it('returns the number of registered payments of the given type',
      function () {
        PaymentService.add(new CashPayment(100));
        PaymentService.add(new CouponPayment(1, 100));
        PaymentService.add(new CouponPayment(2, 200));

        expect(PaymentService.getPaymentCount('cash')).toBe(1);
        expect(PaymentService.getPaymentCount('coupon')).toBe(2);
      });

    it('returns the number of payments of all types if no type is given',
      function () {
        PaymentService.add(new CashPayment(100));
        PaymentService.add(new CouponPayment(1, 100));
        PaymentService.add(new CouponPayment(2, 200));

        expect(PaymentService.getPaymentCount()).toBe(3);
      });
});
