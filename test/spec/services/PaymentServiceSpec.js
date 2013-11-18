describe('Service: PaymentServiceSpec', function() {

    var paymentTemplate = {};

    // load the service's module
    beforeEach(function() {
        paymentTemplate = angular.copy(sampleData.paymentTemplate);

        var mock = {
            customers : angular.copy(sampleData.customers),
            products : angular.copy(sampleData.products),
            orders : angular.copy(sampleData.orders),
            payments : [],
            currentPayments : {
                total : 0,
                checks : [],
                checksTotal : 0,
                creditCards : [],
                creditCardsTotal : 0
            }
        };
        module('tnt.catalog.service.payment');
        module(function($provide) {
            $provide.value('DataProvider', mock);
        });

    });

    // instantiate service
    beforeEach(inject(function(_$filter_, _PaymentService_, _DataProvider_) {
        $filter = _$filter_;
        DataProvider = _DataProvider_;
        PaymentService = _PaymentService_;
    }));

    /**
     * It should inject the dependencies.
     */
    it('should inject dependencies', function() {
        expect(!!$filter).toBe(true);
        expect(!!DataProvider).toBe(true);
        expect(!!PaymentService).toBe(true);
    });

    /**
     * It should attach a new payment in the payments list
     */
    it('should create a new payment', function() {

        paymentTemplate.id = PaymentService.payments.length + 1;

        var savedPayment = PaymentService.createNew();

        var lastPayment = PaymentService.payments[PaymentService.payments.length - 1];

        expect(lastPayment).toEqual(paymentTemplate);
        expect(lastPayment).toBe(savedPayment);
    });

    /**
     * It should save the current payments.
     */
    it('should save the payment', function() {

        var paymentsSize = DataProvider.payments.length;

        var payment1 = PaymentService.createNew();

        payment1.amount = 150;
        payment1.data = {};
        payment1.typeId = 1;

        var payment2 = PaymentService.createNew();

        payment2.amount = 300;
        payment2.data = {};
        payment2.typeId = 2;

        var payments = PaymentService.save(1, 1);

        expect(payments).toEqual([
            payment1, payment2
        ]);
        expect(DataProvider.payments.slice(paymentsSize, 3)).toEqual(payments);
        expect(DataProvider.payments[paymentsSize]).toBe(payments[paymentsSize]);
        expect(DataProvider.payments[paymentsSize+1]).toBe(payments[paymentsSize+1]);

    });

});
