'use strict';

describe('Controller: PaymentCreditCardCtrl', function() {

    var scope = {};
    var element = {};
    var dp = {};
    var ps = {};
    
    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.creditcard');
        module('tnt.catalog.filter.findBy');
    });
    
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        scope = $rootScope.$new();
        scope.creditCardForm = {
            $valid : true
        };
        scope.findPaymentTypeByDescription = function(value) {
            return 3;
        };
        scope.payments = angular.copy(sampleData.payments);
        
        // element mock
        element.find = function(name) {
            var element = {
                removeClass : function(name) {
                    return this;
                },
                addClass : function(name) {
                    return this;
                }
            };
            return element;
        };

        // data provider  mock
        dp.payments = angular.copy(sampleData.payments);
        dp.cardData = angular.copy(sampleData.cardData);

        // payment service mock
        ps.createNew = jasmine.createSpy('PaymentService.createNew').andCallFake(function(type) {
            var payment = {};
            ps.payments.push(payment);
            return payment;
        });
        
        // reproduce the scope inheritance
        ps.payments = angular.copy(sampleData.payments);
        scope.payments = ps.payments;

        $controller('PaymentCreditCardCtrl', {
            $scope : scope,
            $filter : _$filter_,
            $element : element,
            DataProvider : dp,
            PaymentService : ps
        });
    }));
    
    
    /**
     * Given - a installment
     * And   - a flag
     * And   - an amount
     * And   - addCreditCard function receive the credit card object as parameter
     * And   - creditCardForm is valid
     * When  - the add payment button is clicked
     * Then  - call the createNew to have an instance of payment
     * And   - copy the credit card data to this instance
     * And   - clear the current credit card payment  
     */
    it('should add a credit card payment', function() {
        // given
        scope.creditcard = angular.copy(sampleData.payment.creditcard.data);
        scope.creditcard.amount = sampleData.payment.creditcard.amount;
        var creditcard = angular.copy(scope.creditcard);
        delete creditcard.amount;
        var paymentsSize = scope.payments.length;

        // when
        scope.addCreditCard(scope.creditcard);
        
        // then
        expect(ps.createNew).toHaveBeenCalledWith('creditcard');
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize].data).toEqual(creditcard);
        expect(scope.creditcard.amount).toBeUndefined();
    });
    
    /**
     * Given - a invalid creditCardForm
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
     * Given - that a payment is passed to the remove function
     * When  - the remove payment button is clicked
     * Then  - remove payment in the second position from the list
     */
    it('should remove a credit card payment', function() {
        var payment = scope.payments[1];
        var paymentsSize = scope.payments.length;

        scope.removeCreditCard(payment);

        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });
    
});
