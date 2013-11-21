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
     * Given - a add payment button click
     * And   - addCard function receive the credit card object as parameter
     * And   - creditCardForm is valid
     * When  - installments, flag, and amount are filled
     * Then  - call the createNew to have an instance of payment
     * And   - copy the credit card data to this instance
     * And   - clear the current credit card payment  
     */
    it('should add a credit card payment', function() {
        scope.creditcard = angular.copy(sampleData.payment.creditcard.data);
        var creditcard = angular.copy(scope.creditcard);
        var paymentsSize = scope.payments.length;

        scope.addCheck(scope.creditcard);
        
        expect(ps.createNew).toHaveBeenCalledWith('creditcard');
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize].data).toEqual(creditcard);
        expect(scope.creditcard.installments).toBeNull();
        expect(scope.creditcard.flag).toBeNull();
        expect(scope.creditcard.amount).toBeNull();
    });
    
    /**
     * Given - an add payment button click
     * When  - checkForm is invalid
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add a credit card payment with invalid form', function() {
        scope.creditcard = angular.copy(sampleData.payment.creditcard.data);
        var creditcard = angular.copy(scope.creditcard);
        var paymentsSize = scope.payments.length;
        scope.checkForm.$valid = false;
        
        scope.addCheck(scope.creditcard);
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.creditcard).toEqual(creditcard);

    });
    
    
});
