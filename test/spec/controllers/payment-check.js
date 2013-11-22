describe('Controller: PaymentCheckCtrl', function() {

    var scope = {};
    var element = {};
    var dp = {};
    var ds = {};
    var ps = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
        module('tnt.catalog.filter.findBy');
    });
    beforeEach(inject(function($controller, $rootScope, _$filter_) {
        // scope mock
        scope = $rootScope.$new();
        scope.checkForm = {
            $valid : true
        };
        scope.findPaymentTypeByDescription = function(value) {
            return {
                id : 2
            };
        };

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

        // data provider mock
        dp.payments = angular.copy(sampleData.payments);

        // dialog service mock
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        // payment service mock
        ps.createNew = jasmine.createSpy('PaymentService.createNew').andCallFake(function(type) {
            var payment = {};
            ps.payments.push(payment);
            return payment;
        });

        // reproduce the scope inheritance
        ps.payments = angular.copy(sampleData.payments);
        scope.payments = ps.payments;

        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $element : element,
            $filter : _$filter_,
            DialogService : ds,
            PaymentService : ps
        });
    }));

    /**
     * Given - that the bank is filled 
     * And   - agency is filled 
     * And   - account is filled 
     * And   - number is filled 
     * And   - due date is filled 
     * And   - amount is filled 
     * And   - addCheck function receive the check object as parameter 
     * And   - checkForm is valid 
     * When  - the add payment button is clicked
     * Then  - call the createNew to have an instance of payment
     * And   - copy the check data to this instance
     * And   - clear the current check payment
     */
    it('should add a check payment', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check.data);
        scope.check.amount = sampleData.payment.check.amount;
        
        var check = angular.copy(scope.check);
        delete check.amount;
        
        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);


        // then
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
     * Given - that the checkForm is invalid
     * When  - the add payment button is clicked
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment
     */
    it('shouldn\'t add a check payment with invalid form', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check.data);
        scope.checkForm.$valid = false;

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);

        // then
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);

    });

    /**
     * Given - a list of payments
     * And   - the checkForm is valid
     * And   - the payments list already have a payment with a check with the same bank, agency, account and number
     * When  - the add payment button is clicked
     * Then  - do not add to payments in PaymentService
     * And   - keep the current check payment
     * And   - warn the user
     */
    it('shouldn\'t add a repeated check payment', function() {
        // given
        // list of payment in the before each
        angular.extend(scope.check, sampleData.payment.check.data);
        scope.check.amount = sampleData.payment.check.amount;
        scope.payments.push(sampleData.payment.check);

        var check = angular.copy(scope.check);
        var paymentsSize = scope.payments.length;

        // when
        scope.addCheck(scope.check);

        // then
        expect(scope.payments.length).toBe(paymentsSize);
        expect(scope.check).toEqual(check);
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento com Cheque',
            message : 'Não é possível inserir um cheque que já existe na lista.',
            btnYes : 'OK'
        });
    });

    /**
     * Given - that the check payment is filled with bank
     * And   - agency
     * And   - account
     * And   - number
     * And   - check
     * And   - duedate
     * And   - amount
     * When  - the clear button is clicked
     * Then  - Clear all fields
     */
    it('should clear the check payment', function() {
        // given
        angular.extend(scope.check, sampleData.payment.check.data);

        // when
        scope.clearCheck(scope.check);

        // then
        expect(scope.check.bank).toBeNull();
        expect(scope.check.agency).toBeNull();
        expect(scope.check.account).toBeNull();
        expect(scope.check.number).toBeNull();
        expect(scope.check.duedate).toBeNull();
        expect(scope.check.amount).toBeNull();
    });

    /**
     * Given - a list of payments
     * And   - the payment is passed to the removeCheck function
     * When  - the remove payment button is clicked
     * Then  - remove payment in the second position from the list
     */
    it('should remove a check payment', function() {
        // given
        // list of payment in the before each
        var payment = scope.payments[1];
        var paymentsSize = scope.payments.length;

        // then
        scope.removeCheck(payment);

        // when
        expect(scope.payments[1]).not.toEqual(payment);
        expect(scope.payments.length).toBe(paymentsSize - 1);
    });

});