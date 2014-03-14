'use strict';

describe('Service: Payment', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
    });

    // instantiate service
    var CheckPayment = undefined;
    beforeEach(inject(function(_CheckPayment_) {
        CheckPayment = _CheckPayment_;
    }));

    it('should create a new CheckPayment entity', function() {

        var bank = 1234; // 4 digits
        var agency = 3282; // without verifier
        var account = 110222;
        var check = 1;
        var expiration = 1386179100000;
        var amount = 123.4;

        expect(function() {
            var checkPayment = new CheckPayment(null, amount, bank, agency, account, check, expiration);
        }).not.toThrow();
    });

    it('should not create a new CheckPayment entity whith more than the expected quantity of parameters', function() {

        var bank = 1234; // 4 digits
        var agency = 3282; // without verifier
        var account = 110222;
        var check = 1;
        var expiration = 1386179100000;
        var amount = 123.4;
        var fake = 'fake';

        expect(function() {
            var checkPayment = new CheckPayment(null, amount, bank, agency, account, check, expiration, fake);
        }).toThrow();

    });

    it('should not create a new CheckPayment entity with less than the expected quantity of parameters', function() {

        var bank = 1234; // 4 digits
        var agency = 3282; // without verifier
        var account = 110222;
        var check = 1;
        var amount = 123.4;
        
        expect(function() {
            var checkPayment = new CheckPayment(null, amount, bank, agency, account, check);
        }).toThrow();

    });

});
