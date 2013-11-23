describe('Controller: PaymentCtrl', function() {
    var rootScope = {};
    var scope = {};
    var dp = {};
    var ds = {};
    var os = {};
    var ps = {};
    var sms = {};
    var location = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.filter.sum');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, $q, _$filter_) {
        // $location mock
        location.path = jasmine.createSpy('location.path');

        // DataProvider mock
        dp.payments = [];
        dp.customers = angular.copy(sampleData.customers);
        dp.representative = angular.copy(sampleData.representative);

        // DialogService mock
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        // OrdeService mock
        os.order = angular.copy(sampleData.order);
        os.order.customerId = 1;
        os.save = jasmine.createSpy('OrderService.save').andReturn(angular.copy(sampleData.orderSaveReturn));
        os.clear = jasmine.createSpy('OrderService.clear');

        // PaymentService mock
        ps.payments = angular.copy(sampleData.payments);
        ps.save = jasmine.createSpy('PaymentService.save').andReturn(angular.copy(sampleData.paymentSaveReturn));
        ps.clear = jasmine.createSpy('PaymentService.clear');

        // Scope mock
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.payments = angular.copy(sampleData.payments);

        // SMSService mock
        sms.sendPaymentConfirmation =
                jasmine.createSpy('SMSService.sendPaymentConfirmation')
                        .andReturn(angular.copy(sampleData.smsSendPaymentConfirmationReturn));

        // Injecting into the controller
        $controller('PaymentCtrl', {
            $scope : scope,
            $location : location,
            $q : $q,
            DataProvider : dp,
            DialogService : ds,
            OrderService : os,
            PaymentService : ps,
            SMSService : sms
        });
        $filter = _$filter_;
    }));

    /**
     * Should have the order items available in the scope.
     */
    it('should have the order items', function() {
        expect(scope.items).toBe(os.order.items);
    });

    /**
     * Should cancel the payment and leave everything else untouched.
     */
    it('should cancel payment', function() {
        var payments = angular.copy(dp.payments);
        scope.cancel();
        rootScope.$apply();
        // should leave the payments list untouched.
        expect(dp.payments).toEqual(payments);
        // should warn the user about data loss.
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Cancelar Pagamento',
            message : 'Cancelar o pagamento irá descartar os dados desse pagamento permanentemente. Você tem certeza que deseja cancelar?',
            btnYes : 'Cancelar',
            btnNo : 'Retornar'
        });
        // should clear the payments
        expect(ps.clear).toHaveBeenCalled();
        // should go home.
        expect(location.path).toHaveBeenCalledWith('/');
    });

    /**
     * Should confirm the payment.
     */
    it('should confirm payment', function($rootScope) {
        var customer = $filter('findBy')(dp.customers, 'id', os.order.customerId);
        var orderAmount = $filter('sum')(os.order.items, 'price', 'qty');

        scope.confirm();
        rootScope.$apply();

        // The order should be saved.
        expect(os.save).toHaveBeenCalled();
        expect(os.clear).toHaveBeenCalled();
        // The payment should be saved.
        expect(ps.save).toHaveBeenCalledWith(1, 1);
        expect(ps.clear).toHaveBeenCalled();
        // The confirmation dialog should be displayed.
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento',
            message : 'Deseja confirmar o pagamento?',
            btnYes : 'Confirmar',
            btnNo : 'Cancelar'
        });
        // The SMS should be sent.
        expect(sms.sendPaymentConfirmation).toHaveBeenCalledWith(customer, orderAmount);
        // And finally go home soldier you deserve it.
        expect(location.path).toHaveBeenCalledWith('/');
    });

    /**
     * Shouldn't confirm the payment if the total is greater than then the order
     * amount.
     */
    it('shouldn\'t confirm an over payment', function() {

        scope.payments.push({
            id : scope.payments.length + 1,
            datetime : 1383066000000,
            typeId : 1,
            customerId : 1,
            orderId : 1,
            amount : 15,
            data : {}
        });

        var payments = angular.copy(scope.payments);

        scope.confirm();
        rootScope.$apply();

        // leave the payment untouched.
        expect(payments).toEqual(scope.payments);
        // show the warning dialog.
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento inválido',
            message : 'Valor registrado para pagamento é maior do que o valor total do pedido.',
            btnYes : 'OK',
        });
    });

    /**
     * Shouldn't confirm the payment if the total is less than the order amount.
     */
    it('shouldn\'t confirm a under payment', function() {
        scope.payments.pop();

        var payments = angular.copy(scope.payments);

        scope.confirm();
        rootScope.$apply();

        // leave the payment untouched.
        expect(payments).toEqual(scope.payments);
        // show the warning dialog.
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento inválido',
            message : 'Valor registrado para pagamento é menor do que o valor total do pedido.',
            btnYes : 'OK'
        });
    });
    
    /**
     * Given - a list of payments
     * When  - confirm button is clicked
     * Then  - Make a backup of the list
     * And   - redirect to order items
     */
    it('should confirm all payments', function() {
        // given
        // list of payment in the before each
        var payments = angular.copy(scope.payments);
        
        // when
        scope.confirmPayments();
        
        // then
        expect(scope.payments).toEqual(payments);
        expect(scope.selectedPaymentMethod).toBe('none');
    });
    
    /**
     * Given - a list of payments
     * And   - the confirm button is clicked
     * And   - a payment is removed
     * When  - cancel button is clicked
     * Then  - restore the original list
     * And   - redirect to order items
     */
    it('should undo payments after a payment be removed', function() {
        // given
        // list of payment in the before each
        scope.confirmPayments();
        scope.payments.pop();
        
        // when
        scope.cancelPayments();
        
        // then
        expect(scope.payments).toEqual(sampleData.payments);
        expect(scope.selectedPaymentMethod).toBe('none');
    });
    
    /** 
     * Given - a list of payments
     * And   - the confirm button is clicked
     * And   - a payment is added
     * When  - cancel button is clicked
     * Then  - restore the original list
     * And   - redirect to order items
     */
    it('should undo payments after a payment be removed', function() {
        // given
        // list of payment in the before each
        scope.confirmPayments();
        var newPayment = angular.copy(scope.payments[0]);
        newPayment.id = scope.payments.length + 1;
        scope.payments.push(newPayment);
        
        // when
        scope.cancelPayments();
        
        // then
        expect(scope.payments).toEqual(sampleData.payments);
        expect(scope.selectedPaymentMethod).toBe('none');
    });

});
