describe('Controller: PaymentCheckCtrl', function() {

    var scope = {};
    var dp = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
    });
    beforeEach(inject(function($controller) {
        scope.check = angular.copy(sampleData.payment.check);
        dp.payments = angular.copy(sampleData.payments);
        $controller('PaymentCheckCtrl', {
            $scope : scope,
            DataProvider : dp,
        });
    }));
    
    
    /**
     * Given - the payments list in PaymentService
     * When  - the screen opens 
     * Then  - show only the check payments 
     */
    it('should filter payments', function() {

    });
    
    /**
     * Given - a add payment button click
     * When  - bank, agency, account, number, due date and amount are filled
     * Then  - add to payments in PaymentService
     * And   - clear the current check payment  
     */
    it('should add to payments', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - bank not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - bank', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - agency not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - agency', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - account not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - account', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - number not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - number', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - due date not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - due date', function() {

    });
    
    /**
     * Given - an add payment button click
     * When  - amount not filled.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments - amount', function() {

    });
    
    /**
     * Given - the payments list in PaymentService
     * When  - remove payment button click is executed
     * Then  - remove payment from the list
     */
    it('should remove from payments', function() {

    });
    
});