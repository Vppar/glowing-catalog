describe('Service: PaymentServiceUpdate', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
    });

    // instantiate service
    beforeEach(inject(function(_Payment_, _CashPayment_, _CheckPayment_, _CreditCardPayment_, _ExchangePayment_, _CouponPayment_,
            _PaymentService_, _OnCuffPayment_) {
        Payment = _Payment_;
        CashPayment = _CashPayment_;
        CheckPayment = _CheckPayment_;
        CreditCardPayment = _CreditCardPayment_;
        ExchangePayment = _ExchangePayment_;
        CouponPayment = _CouponPayment_;
        PaymentService = _PaymentService_;
        OnCuffPayment = _OnCuffPayment_;
    }));

    /**
     * It should inject the dependencies.
     */
    it('should inject dependencies', function() {
        expect(!!$filter).toBe(true);
        expect(!!PaymentService).toBe(true);
    });

    it('should update a cash payment', function() {
        // given
        var payment = new CashPayment(15);
        var payments = [];

        PaymentService.add(payment);
        payment.amount = 20;
        
        // when
        var updateCall = function() {
            PaymentService.update(payment);
            payments = PaymentService.list('cash');
        };
        // then
        expect(updateCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('shouldn\'t update a cash payment', function() {
        // given
        var payment = new CashPayment(15);

        PaymentService.add(payment);
        payment.id = 5;
        payment.amount = 20;
        
        // when
        var updateCall = function() {
            payments = PaymentService.update(payment);
        };
        
        // then
        expect(updateCall).toThrow();
    });
});
