describe('Service: PaymentServiceAddAll', function() {

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


    it('adds all payments to the temporary payments list', function () {
      expect(PaymentService.list('cash').length).toBe(0);
      expect(PaymentService.list('coupon').length).toBe(0);

      PaymentService.addAll([new CashPayment(100), new CouponPayment(30)]);

      expect(PaymentService.list('cash').length).toBe(1);
      expect(PaymentService.list('cash')[0].amount).toBe(100);
      expect(PaymentService.list('coupon').length).toBe(1);
      expect(PaymentService.list('coupon')[0].amount).toBe(30);
    });


    it('throws an error if an invalid payment is given', function () {
      expect(function () {
        PaymentService.addAll(['invalidPayment']);
      }).toThrow('PaymentService.add: The object is not an instance of any known type of payment, Object="invalidPayment"');
    });

});
