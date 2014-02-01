// FIXME - This whole test suit needs review
xdescribe('Service: PaymentServiceRead', function() {

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

    /**
     * TODO - Check if the method is going to be updated or this test removed.
     * right now cash payments dosn't have ids.
     */
    xit('should read a cash payments', function() {
        // given
        var result = null;
        var payment = new CashPayment(15);

        PaymentService.add(payment);

        // when
        var readCall = function() {
            result = PaymentService.read('cash', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('should read a check payments', function() {
        // given
        var result = null;
        var amount = 20;
        var bank = 123;
        var agency = 456;
        var account = 789;
        var check = 0123;
        var expiration = 123456789;
        var payment = new CheckPayment(amount, bank, agency, account, check, expiration);

        PaymentService.add(payment);

        // when
        var readCall = function() {
            result = PaymentService.read('check', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('should read a credit card payments', function() {
        // given
        var result = null;
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
        var readCall = function() {
            result = PaymentService.read('creditCard', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('should read a exchange payment', function() {
        // given
        var result = null;
        var payment = new ExchangePayment(15);

        PaymentService.add(payment);

        // when
        var readCall = function() {
            result = PaymentService.read('exchange', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('should read a coupon payment', function() {
        // given
        var result = null;
        var payment = new CouponPayment(15);

        PaymentService.add(payment);

        // when
        var readCall = function() {
            result = PaymentService.read('coupon', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('should read a onCuff payment', function() {
        // given
        var result = null;
        var payment = new OnCuffPayment(15,new Date());

        PaymentService.add(payment);

        // when
        var readCall = function() {
            result = PaymentService.read('onCuff', payment.id);
        };

        // then
        expect(readCall).not.toThrow();
        expect(result).toEqual(payment);
    });

    it('shouldn\'t read unknown payment', function() {
        // given
        var id = 2;
        var payment = new CashPayment(15);

        PaymentService.add(payment);

        // when
        var readCall = function() {
            payments = PaymentService.read('cash', id);
        };

        // then
        expect(readCall).toThrow('PaymentService.read: Unknown payment instance, id=' + id);
    });
});
