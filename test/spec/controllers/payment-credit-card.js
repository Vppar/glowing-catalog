'use strict';

describe('Controller: PaymentCreditCardCtrl', function() {

    var scope = {};
    var dp = {};
    var ds = {};
    var ps = {};
    
    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.creditcard');
        module('tnt.catalog.filter.findBy');
    });
    
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        scope = $rootScope.$new();
        scope.creditCardForm = {
            $valid : true
        };
        scope.findPaymentTypeByDescription = function(value) {
            return 3;
        };
        scope.payments = angular.copy(sampleData.payments);

        dp.payments = angular.copy(sampleData.payments);

        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        ps.payments = scope.payments;
        ps.createNew = jasmine.createSpy('PaymentService.createNew').andCallFake(function(type) {
            var payment = {};
            ps.payments.push(payment);
            return payment;
        });

        $controller('PaymentCreditCardCtrl', {
            $scope : scope,
            $filter : _$filter_,
            DialogService : ds,
            PaymentService : ps
        });
    }));
    
    
    /**
     * Given - that the installments field is filled
     * And   - the flag is filled
     * And   - the amount is filled
     * And   - addCard function receive the credit card object as parameter
     * And   - creditCardForm is valid
     * When  - the add payment button is clicked
     * Then  - call the createNew to have an instance of payment
     * And   - copy the credit card data to this instance
     * And   - clear the current credit card payment  
     */
    it('should add a credit card payment', function() {
        scope.creditcard = angular.copy(sampleData.payment.creditcard.data);
        var creditcard = angular.copy(scope.creditcard);
        var paymentsSize = scope.payments.length;

        scope.addCreditCard(scope.creditcard);
        
        expect(ps.createNew).toHaveBeenCalledWith('creditcard');
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize].data).toEqual(creditcard);
        expect(scope.creditcard.installments).toBeNull();
        expect(scope.creditcard.flag).toBeNull();
        expect(scope.creditcard.amount).toBeNull();
    });
    
    /**
     * Given - that the checkForm is invalid
     * When  - the add payment button is clicked
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add a credit card payment with invalid form', function() {
        scope.creditcard = angular.copy(sampleData.payment.creditcard.data);
        var creditcard = angular.copy(scope.creditcard);
        var paymentsSize = scope.payments.length;
        scope.creditCardForm.$valid = false;
        
        scope.addCreditCard(scope.creditcard);
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.creditcard).toEqual(creditcard);

    });
    
    /**
     * Given - that the paymentId is passed to the remove function
     * When  - the remove payment button is clicked
     * Then  - remove payment in the second position from the list
     */
    it('should remove a credit card payment', function() {
        var payment = angular.copy(scope.payments[1]);
        var paymentsSize = scope.payments.length;

        scope.removeCreditCard(2);

        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });
    
});
