describe('Controller: PaymentCheckCtrl', function() {

    var scope = {};
    var dp = {};
    var ps = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
    });
    beforeEach(inject(function($controller) {
        scope.check = angular.copy(sampleData.payment.check);
        dp.payments = angular.copy(sampleData.payments);
        ps.payments = angular.copy(sampleData.payments);
        $controller('PaymentCheckCtrl', {
            $scope : scope,
            DataProvider : dp,
            PaymentService : ps
        });
    }));
    
    
    /**
     * Given - the screen opening
     * When  - load is done 
     * Then  - the payments of PaymentService are available in the scope
     * And   - the paymentTypeFilter is available in the scope
     */
    it('should filter payments', function() {
        expect(scope.payments).toBe(ps.payments);
        expect(scope.paymentTypeFilter).toBe(ps.payments);
    });
    
    /**
     * Given - a add payment button click
     * When  - bank, agency, account, number, due date and amount are filled
     * Then  - add to payments in PaymentService
     * And   - clear the current check payment  
     */
    it('should add to payments', function() {
        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        scope.add();

        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize]).toEqual(check);
        expect(scope.check.bank).toBeUndefined();
        expect(scope.check.agency).toBeUndefined();
        expect(scope.check.account).toBeUndefined();
        expect(scope.check.number).toBeUndefined();
        expect(scope.check.duedate).toBeUndefined();
        expect(scope.check.amount).toBeUndefined();
    });
    
    /**
     * Given - an add payment button click
     * When  - bank not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - bank', function() {
        delete scope.check.bank; 
        var paymentsSize = scope.payments;
        var check = angular.copy(scope.check);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);

    });
    
    /**
     * Given - an add payment button click
     * When  - agency not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - agency', function() {
        delete scope.check.agency; 
        var paymentsSize = scope.payments;
        var agency = angular.copy(scope.agency);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.agency).toEqual(agency);
    });
    
    /**
     * Given - an add payment button click
     * When  - account not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - account', function() {
        delete scope.check.account; 
        var paymentsSize = scope.payments;
        var account = angular.copy(scope.account);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.account).toEqual(account);
    });
    
    /**
     * Given - an add payment button click
     * When  - number not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - number', function() {
        delete scope.check.number; 
        var paymentsSize = scope.payments;
        var number = angular.copy(scope.number);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.number).toEqual(number);
    });
    
    /**
     * Given - an add payment button click
     * When  - due date not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - due date', function() {
        delete scope.check.duedate; 
        var paymentsSize = scope.payments;
        var duedate = angular.copy(scope.duedate);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.duedate).toEqual(duedate);
    });
    
    /**
     * Given - an add payment button click
     * When  - amount not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - amount', function() {
        delete scope.check.amount; 
        var paymentsSize = scope.payments;
        var amount = angular.copy(scope.amount);

        scope.add();
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.amount).toEqual(amount);
    });
    
    /**
     * Given - an remove payment button click
     * When  - the index is passed to the remove function is 1
     * Then  - remove payment in the position 1 from the list
     */
    it('should remove from payments', function() {
        var payment = angular.copy(scope.payments[1]);
        var paymentsSize = scope.payments.length;

        scope.remove(1);

        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });
    
});