describe('Service: PaymentServiceRemove', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
    });

    // instantiate service
    beforeEach(inject(function(_Payment_, _CashPayment_, _CheckPayment_, _CreditCardPayment_, _ExchangePayment_, _CouponPayment_,
            _PaymentService_) {
        Payment = _Payment_;
        CashPayment = _CashPayment_;
        CheckPayment = _CheckPayment_;
        CreditCardPayment = _CreditCardPayment_;
        ExchangePayment = _ExchangePayment_;
        CouponPayment = _CouponPayment_;
        PaymentService = _PaymentService_;
    }));

    /**
     * It should inject the dependencies.
     */
    it('should inject dependencies', function() {
        expect(!!$filter).toBe(true);
        expect(!!PaymentService).toBe(true);
    });

    it('should remove a cash payment', function() {
        // given
        var payment15 = new CashPayment(15);
        var payment20 = new CashPayment(20);
        var payment30 = new CashPayment(30);

        var payments = [];

        PaymentService.add(payment15);
        PaymentService.add(payment20);
        PaymentService.add(payment30);

        // when
        var removeCall = function() {
            PaymentService.remove(payment20);
            payments = PaymentService.list('cash');
        };

        // then
        expect(removeCall).not.toThrow();
        expect(payments.length).toBe(2);
        expect(payments[0]).toEqual(payment15);
        expect(payments[1]).toEqual(payment30);
    });

    it('shouldn\'t remove an unknown payment', function() {
        // given
        var payment15 = new CashPayment(15);

        PaymentService.add(payment15);

        var payment20 = new CashPayment(20);
        payment20.id = 3;

        // when
        var removeCall = function() {
            PaymentService.remove(payment20);
        };

        // then
        expect(removeCall).toThrow('PaymentService.remove: Unknown payment instance, id=' + payment20.id);
    });
});
