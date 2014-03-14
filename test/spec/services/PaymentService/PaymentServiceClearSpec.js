// FIXME - This whole test suit needs review
xdescribe('Service: PaymentServiceClear', function() {

    var orderService = {};
    var entityService = {};
    var voucherService = {};
    var receivableService = {};
    var productReturnService = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.service.coupon');

        module(function($provide) {
            $provide.value('OrderService', orderService);
            $provide.value('EntityService', entityService);
            $provide.value('VoucherService', voucherService);
            $provide.value('ReceivableService', receivableService);
            $provide.value('ProductReturnService', productReturnService);
        });
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
      PaymentService.add(new CheckPayment(null, 123, 123, 123, 123, 123, new Date()));
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

});
