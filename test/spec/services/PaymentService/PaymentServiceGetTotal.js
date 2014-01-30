describe('Service: PaymentServiceGetTotal', function() {

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

    it('returns the total ammount for all payments if called without arguments',
      function () {
        // All amounts set to 1
        PaymentService.add(new CashPayment(1));
        PaymentService.add(new CouponPayment(1));
        PaymentService.add(new CheckPayment(1, 123, 123, 123, 123, new Date()));
        PaymentService.add(new CheckPayment(1, 123, 123, 123, 123, new Date()));
        PaymentService.add(new CreditCardPayment(1, 'VISA', 123, 'FOO', '02-2016', 123, '000.000.000-00', 1));
        PaymentService.add(new CreditCardPayment(1, 'VISA', 123, 'FOO', '02-2016', 123, '000.000.000-00', 1));
        PaymentService.add(new OnCuffPayment(1, new Date()));
        PaymentService.add(new ExchangePayment(3, 123, 1, 1, 1));
        PaymentService.add(new CouponPayment(1));

        expect(PaymentService.getTotal()).toBe(9);
      });

    it('returns 0 if no payments have been added', function () {
      expect(PaymentService.getTotal()).toBe(0);
    });

    it('returns the total for the given payment type', function () {
        PaymentService.add(new CashPayment(1));
        PaymentService.add(new CashPayment(1));
        PaymentService.add(new CashPayment(1));

        expect(PaymentService.getTotal('cash')).toBe(3);
    });

    it('returns 0 if there are no payments for the given payment type', function () {
      expect(PaymentService.getTotal('check')).toBe(0);
    });

    it('throws an error if called with an invalid payment type');
});
