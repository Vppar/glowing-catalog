describe('Controller: PaymentCheckCtrl', function() {

    var scope = {};
    var dp = {};
    var ds = {};
    var ps = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
        module('tnt.catalog.filter.findBy');
    });
    beforeEach(inject(function($controller, _$filter_) {
        scope.checkForm = {
            $valid : true
        };
        scope.findPaymentTypeByDescription = function(value) {
            return 2;
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

        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $filter : _$filter_,
            DialogService : ds,
            PaymentService : ps
        });
    }));
    
    
    /**
     * Given - a add payment button click
     * And   - addCheck function receive the check object as parameter
     * And   - checkForm is valid
     * When  - bank, agency, account, number, due date and amount are filled
     * Then  - call the createNew to have an instance of payment
     * And   - copy the check data to this instance
     * And   - clear the current check payment  
     */
    it('should add to payments', function() {
        scope.check = angular.copy(sampleData.payment.check.data);
        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        scope.addCheck(scope.check);
        
        expect(ps.createNew).toHaveBeenCalledWith('check');
        expect(scope.payments.length).toBe(paymentsSize + 1);
        expect(scope.payments[paymentsSize].data).toEqual(check);
        expect(scope.check.bank).toBeNull();
        expect(scope.check.agency).toBeNull();
        expect(scope.check.account).toBeNull();
        expect(scope.check.number).toBeNull();
        expect(scope.check.duedate).toBeNull();
        expect(scope.check.amount).toBeNull();
    });
    
    /**
     * Given - an add payment button click
     * When  - checkForm is invalid
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment  
     */
    it('shouldn\'t add to payments with invalid form', function() {
        scope.check = angular.copy(sampleData.payment.check.data);
        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;
        scope.checkForm.$valid = false;
        
        scope.addCheck(scope.check);
        
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);

    });
    
    /**
     * Given - an add payment button click
     * And   - checkForm is valid
     * When  - the payments list already have a payment with the same bank, agency, account and number.
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment
     * And   - warn the user.
     */
    it('shouldn\'t add a repeated check to payments', function() {
        scope.check = angular.copy(sampleData.payment.check.data);
        scope.payments.push(sampleData.payment.check);

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        scope.addCheck(scope.check);

        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento com Cheque',
            message : 'Não é possível inserir um cheque que já existe na lista.',
            btnYes : 'OK'
        });
    });
    
    /**
     * Given - an remove payment button click
     * When  - the paymentId is passed to the remove function is 2
     * Then  - remove payment in the position 2 from the list
     */
    it('should remove from payments', function() {
        var payment = angular.copy(scope.payments[1]);
        var paymentsSize = scope.payments.length;

        scope.removeCheck(2);

        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });
    
});