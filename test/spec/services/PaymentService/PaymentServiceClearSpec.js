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
      expect(PaymentService.list('coupon').length).toBe(1);
      PaymentService.clear('coupon');
      expect(PaymentService.list('coupon').length).toBe(0);
    });

    it('sets cash amount to 0', function () {
      PaymentService.add(new CashPayment(150));
      expect(PaymentService.list('cash').amount).toBe(150);
      PaymentService.clear('cash');
      expect(PaymentService.list('cash').amount).toBe(0);
    });

    it('throws an error for invalid payment types', function () {
      expect(function () {
        PaymentService.clear('invalidPaymentType');
      }).toThrow('PaymentService.clear: invalid payment type');
    });

});
