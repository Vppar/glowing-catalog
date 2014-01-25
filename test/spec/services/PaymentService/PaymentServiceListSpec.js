describe('Service: PaymentServiceList', function() {

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

    it('should list the cash payments', function() {
        // given
        var payments = [];
        var payment = new CashPayment(15);

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('cash');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should list the check payments', function() {
        // given
        var amount = 20;
        var bank = 123;
        var agency = 456;
        var account = 789;
        var check = 0123;
        var expiration = 123456789;
        var payment = new CheckPayment(amount, bank, agency, account, check, expiration);
        var payments = [];

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('check');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should list the credit card payments', function() {
        // given
        var payments = [];
        var amount = 123;
        var flag = 'my own flag';
        var ccNumber = '4567890';
        var owner = 'its me mario';
        var ccDueDate = 12345678;
        var cvv = 123;
        var cpf = 1234567890;
        var installments = 1;
        var payment = new CreditCardPayment(amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments);

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('creditCard');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should list the exchange payments', function() {
        // given
        var payments = [];
        var payment = new ExchangePayment(15);

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('exchange');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should list the coupon payments', function() {
        // given
        var payments = [];
        var payment = new CouponPayment(15);

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('coupon');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should list the onCuff payments', function() {
        // given
        var payments = [];
        var payment = new OnCuffPayment(15,new Date());

        PaymentService.add(payment);

        // when
        var listCall = function() {
            payments = PaymentService.list('onCuff');
        };

        // then
        expect(listCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('shouldn\'t list unknown payments', function() {
        // given
        var typeName = 'payment';

        // when
        var listCall = function() {
            PaymentService.list('payment');
        };

        // then
        expect(listCall).toThrow('PaymentService.list: Unknown type of payment, typeName=' + typeName);
    });

});
