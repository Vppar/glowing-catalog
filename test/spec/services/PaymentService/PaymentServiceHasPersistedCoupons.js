describe('Service: PaymentServiceHasPersistedCoupons', function() {

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


    it('returns true if there are persisted coupons', function () {
      PaymentService.persistCouponQuantity(10, 5);
      expect(PaymentService.persistedCoupons).not.toEqual({});
      expect(PaymentService.hasPersistedCoupons()).toBe(true);
    });


    it('returns false if there are no persisted coupons', function () {
      expect(PaymentService.persistedCoupons).toEqual({});
      expect(PaymentService.hasPersistedCoupons()).toBe(false);
    });
});
