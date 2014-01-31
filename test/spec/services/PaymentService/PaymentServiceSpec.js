describe('Service: PaymentServiceClear', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.service.coupon');
    });

    // instantiate service
    beforeEach(inject(function($rootScope, _Payment_, _CashPayment_, _CheckPayment_, _CreditCardPayment_, _ExchangePayment_, _CouponPayment_,
            _CouponService_, _OnCuffPayment_, _PaymentService_) {

        rootScope = $rootScope;
        spyOn(rootScope, '$broadcast');

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


    // FIXME: implement this. Could not get handlers to get called within 
    // the service.
    xdescribe('PaymentService.paymentsChanged event', function () {
        it('is triggered on PaymentService.add event');
        it('is triggered on PaymentService.clear event');
    });
});
