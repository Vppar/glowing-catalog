// FIXME - This whole test suit needs review
describe('Service: PaymentServiceAdd', function() {

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
            _CouponService_, _PaymentService_, _OnCuffPayment_) {
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

    it('should add a cash payment', function() {
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
        expect(payments).toEqual([
            payment
        ]);
    });

    /**
     * TODO - Check if the method is going to be updated or this test removed.
     * this test dosn't match the actual behavior of cash payments.
     */
    xit('should add a cash payment with sequential ids', function() {
        // given
        var payment15 = new CashPayment(15);
        var payment20 = new CashPayment(20);
        var payments = [];

        // when
        var addCall = function() {
            PaymentService.add(payment15);
            PaymentService.add(payment20);
            payments = PaymentService.list('cash');
        };
        // then
        expect(addCall).not.toThrow();
        expect(payments[0].id).toBe(1);
        expect(payments[0]).toEqual(payment15);
        expect(payments[0]).not.toBe(payment15);
        expect(payments[1].id).toBe(2);
        expect(payments[1]).toEqual(payment20);
        expect(payments[1]).not.toBe(payment20);
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
        expect(payments[0].id).not.toBeUndefined(payment);
    });

    it('should add a credit card payment', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var amount = 123;
        var flag = 'my own flag';
        var ccNumber = '4567890';
        var owner = 'its me mario';
        var ccDueDate = 12345678;
        var cvv = 123;
        var cpf = 1234567890;
        var installments = 1;
        var payment = new CreditCardPayment(uuid, amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments);

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('creditCard');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
        expect(payments[0].id).not.toBeUndefined(payment);
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
        expect(payments[0].id).not.toBeUndefined(payment);
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
        expect(payments[0].id).not.toBeUndefined(payment);
    });

    it('should add a onCuff payment', function() {
        // given
        var payment = new OnCuffPayment(15, new Date());

        // when
        var addCall = function() {
            PaymentService.add(payment);
            payments = PaymentService.list('onCuff');
        };

        // then
        expect(addCall).not.toThrow();
        expect(payments[0]).toEqual(payment);
        expect(payments[0].id).not.toBeUndefined(payment);
    });

    it('shouldn\'t add a unknown payment', function() {
        // given
        var payment = new Payment(15);

        // when
        var addCall = function() {
            PaymentService.add(payment);
        };

        // then
        expect(addCall).toThrow(
                'PaymentService.add: The object is not an instance of any known type of payment, Object=' + JSON.stringify(payment));
    });

});
