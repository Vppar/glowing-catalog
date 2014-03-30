describe('Service: PaymentServiceClearCouponGiftVoucher', function() {
    
    var orderService = {};
    var entityService = {};
    var voucherService = {};
    var receivableService = {};
    var productReturnService = {};
    var stockKeeper = {};
    var smsService = {};
    var BookService = {};

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
            $provide.value('StockKeeper', stockKeeper);
            $provide.value('SMSService', smsService);
            $provide.value('BookService', BookService);
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


    it('clears all quantity data from PaymentService.persistedCoupons',
      function () {
        PaymentService.persistedCoupons[5] = 3;
        PaymentService.persistedCoupons[20] = 5;
        PaymentService.clearCouponGiftVoucher();
        expect(PaymentService.persistedCoupons).toEqual({});
      });


    it('removes custom attributes', function () {
      PaymentService.persistedCoupons.foo = 'bar';
      PaymentService.clearCouponGiftVoucher();
      expect(PaymentService.persistedCoupons).toEqual({});
    });


    // Make sure that once the persistedCoupons object is reset, we are
    // able to persist new coupons.
    it('does not break persistCouponQuantity()', function () {
      PaymentService.persistedCoupons[5] = 5;
      PaymentService.clearCouponGiftVoucher();
      expect(PaymentService.persistedCoupons).toEqual({});

      expect(function () {
        PaymentService.persistCouponQuantity(5, 3);
      }).not.toThrow();

      expect(PaymentService.persistedCoupons).toEqual({
        5 : 3
      });
    });
});
