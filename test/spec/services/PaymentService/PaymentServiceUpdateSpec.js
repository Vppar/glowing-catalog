xdescribe('Service: PaymentServiceUpdate', function() {

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

    it('should add a new cash payment', function() {
        // given
        var payment = new CashPayment(15);
        var payments = [];

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('cash');
        };
        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should add a check payment', function() {
        // given
        var amount = 20;
        var bank = 123;
        var agency = 456;
        var account = 789;
        var check = 0123;
        var expiration = 123456789;
        var payment = new CheckPayment(amount, bank, agency, account, check, expiration);
        var payments = [];

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('check');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should add a credit card payment', function() {
        // given
        var amount = 123;
        var flag = 'my own flag';
        var ccNumber = '4567890';
        var owner = 'its me mario';
        var ccDueDate = 12345678;
        var cvv = 123;
        var cpf = 1234567890;
        var installments = 1;
        var payment = new CreditCardPayment(amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments);

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('creditCard');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should add an exchange payment', function() {
        // given
        var payment = new ExchangePayment(15);

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('exchange');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('should add a coupon payment', function() {
        // given
        var payment = new CouponPayment(15);

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('coupon');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
    });

    it('shouldn\'t add a unknown payment', function() {
        // given
        var payment = new Payment(15);

        // when
        var addCall = function() {
            PaymentService.add(payment);
        };

        // then
        expect(addCall).toThrow('The object is not an instance of any known type of payment. Object=' + JSON.stringify(payment));
    });

});
