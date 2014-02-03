// FIXME - This whole test suit needs review.
xdescribe('Service: PaymentServiceCreateCoupons', function() {

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


    it('calls CouponService.create() for each coupon', function () {
      spyOn(CouponService, 'create');

      PaymentService.persistCouponQuantity(5, 3);
      PaymentService.persistCouponQuantity(10, 2);

      PaymentService.createCoupons();

      expect(CouponService.create).toHaveBeenCalled();
      expect(CouponService.create.calls.length).toBe(5);

      var calls = CouponService.create.calls;
      expect(calls[0].args[1]).toBe('5');
      expect(calls[1].args[1]).toBe('5');
      expect(calls[2].args[1]).toBe('5');
      expect(calls[3].args[1]).toBe('10');
      expect(calls[4].args[1]).toBe('10');
    });
});
