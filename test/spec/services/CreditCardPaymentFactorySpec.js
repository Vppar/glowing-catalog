'use strict';

describe('Service: Payment', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
    });

    // instantiate service
    var CreditCardPayment = undefined;
    beforeEach(inject(function(_CreditCardPayment_) {
        CreditCardPayment = _CreditCardPayment_;
    }));

    /**
     * It should create a CreditCardPayment
     */
    it('should clear the payment', function() {
        var amount = 23;
        var flag = 'Visa';
        var ccNumber = 1234567;
        var owner = 'Jesus';
        var ccDueDate = 12345;
        var cvv = 123;
        var cpf = 093658312946;
        var installments = 2;

        var ccTest = new CreditCardPayment(amount, flag, ccNumber, owner, ccDueDate, cvv, cpf, installments);
        expect(ccTest).not.toBe(null);
    });

    /**
     * It should fail to create a CreditCardPayment
     */
    it('should clear the payment', function() {
        var amount = 23;
        var flag = 'Visa';
        var ccNumber = 1234567;
        var owner = 'Jesus';
        var ccDueDate = 12345;

        expect(function() {
            new CreditCardPayment(amount, flag, ccNumber, owner, ccDueDate);
        }).toThrow();

    });

});
