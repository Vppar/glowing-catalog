describe('Service: PaymentServicePersistCouponQuantity', function() {

    var orderService = {};
    var entityService = {};
    var voucherService = {};
    var receivableService = {};
    var productReturnService = {};
    var stockKeeper = {};
    var smsService = {};

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

    it('sets the quantity of coupons of a given amount', function() {
        var amount = 10, qty = 5;

        PaymentService.persistCouponQuantity(amount, qty);
        expect(PaymentService.persistedCoupons[10]).toBe(5);
    });

    it('removes entry from persistedCoupons if qty is set to 0', function() {
        PaymentService.persistCouponQuantity(10, 5);
        expect(PaymentService.persistedCoupons).toEqual({
            10 : 5
        });
        PaymentService.persistCouponQuantity(10, 0);
        expect(PaymentService.persistedCoupons).toEqual({});
        expect(PaymentService.persistedCoupons).not.toEqual({
            10 : 0
        });
    });
});
