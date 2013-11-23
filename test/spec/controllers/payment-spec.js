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
        module('tnt.catalog.filter.paymentType');
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
        dp.orders = [];

        // DialogService mock
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        // OrdeService mock
        os.order = angular.copy(sampleData.orders[0]);
        os.save = jasmine.createSpy('OrderService.save').andCallFake(function() {
            var orderSaveReturn = angular.copy(sampleData.orderSaveReturn);
            dp.orders.push(orderSaveReturn);
            return orderSaveReturn;
        });
        os.clear = jasmine.createSpy('OrderService.clear');

        // PaymentService mock
        ps.save = jasmine.createSpy('PaymentService.save').andReturn(angular.copy(sampleData.payments));
        ps.clear = jasmine.createSpy('PaymentService.clear');
        ps.createNew = function() {
        };
        ps.payments = [];

        // Scope mock
        rootScope = $rootScope;
        scope = $rootScope.$new();

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
     * Given - a order (OrderService.order) 
     * And   - the order has products (order.items)
     * And   - a customer is selected (order.customerId)
     * And   - payment screen was requested to open
     * When  - payment screen load is done.
     * Then  - the selected scope should be 'none' (scope.selectedPaymentMethod)
     * And   - OrderService.order.items should be binded in the scope.items
     * And   - the customer of the order should be binded in the scope.customer
     * And   - OrderService.order.items should be binded in the scope.items
     */
    it('should have order informations', function() {
        // given
        // provided by beforeEach 
        
        // when
        // done by beforeEach
        
        // then
        expect(scope.selectedPaymentMethod).toBe('none');
        expect(scope.items).toBe(os.order.items);
        // In the sample order I made sure that the selected customer is first of the customers list.  
        expect(scope.customer).toBe(dp.customers[0]);
        expect(scope.items).toBe(os.order.items);
    });

    /**
     * Given - a payments list (scope.payments)
     * When  - cancel payments is request
     * Then  - warn the user about canceling the payment
     * And   - clear the current payment (PaymentService.clear)
     * And   - redirect to the home screen
     * And   - the payment data store should be left untouched (DataProvider.payments)
     */
    it('should cancel payment', function() {
        // given
        angular.extend(scope.payments, sampleData.payments);
        var payments = angular.copy(dp.payments);
        
        // when
        scope.cancel();
        rootScope.$apply();
        
        // then
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Cancelar Pagamento',
            message : 'Cancelar o pagamento irá descartar os dados desse pagamento permanentemente. Você tem certeza que deseja cancelar?',
            btnYes : 'Cancelar',
            btnNo : 'Retornar'
        });
        expect(dp.payments).toEqual(payments);
        expect(ps.clear).toHaveBeenCalled();
        expect(location.path).toHaveBeenCalledWith('/');
    });

    /**
     * Given - a payments list (scope.payments)
     * When  - confirm the payments is request
     * Then  - save the order (OrderService.save)
     * And   - clear the current order (OrderService.clear)
     * And   - save the payments with orderId and customerId (PaymentService.save)
     * And   - clear the current payments (OrderService.clear)
     * And   - link the payments to the order
     * And   - send a SMS to warn the customer about his order (SMSService.sendPaymentConfirmation)
     * And   - go to the home screen
     */
    it('should confirm payment', function($rootScope) {
        // given
        angular.extend(scope.payments, sampleData.payments);
        var customer = $filter('findBy')(dp.customers, 'id', os.order.customerId);
        var orderAmount = $filter('sum')(os.order.items, 'price', 'qty');

        // when
        scope.confirm();
        rootScope.$apply();

        // then
        expect(ds.messageDialog).toHaveBeenCalledWith({
            title : 'Pagamento',
            message : 'Deseja confirmar o pagamento?',
            btnYes : 'Confirmar',
            btnNo : 'Cancelar'
        });
        expect(os.save).toHaveBeenCalled();
        expect(os.clear).toHaveBeenCalled();
        expect(ps.save).toHaveBeenCalledWith(1, 1);
        expect(ps.clear).toHaveBeenCalled();
        expect(dp.orders[dp.orders.length - 1].paymentIds).toEqual([
            1, 2, 3, 4, 5
        ]);
        expect(sms.sendPaymentConfirmation).toHaveBeenCalledWith(customer, orderAmount);
        expect(location.path).toHaveBeenCalledWith('/');
    });

    /**
     * Given - a payment with amount greater then the order amount
     * When  - to confirm payments is requested
     * Then  - the current payments should be left untouched (scope.payments)
     * And   - the user should be warned with a dialog (DialogService.messageDialog)
     */
    it('shouldn\'t confirm an over payment', function() {
        // given
        angular.extend(scope.payments, sampleData.payments);
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
     * Given - a payment with amount less then the order amount
     * When  - to confirm payments is requested
     * Then  - the current payments should be left untouched (scope.payments)
     * And   - the user should be warned with a dialog (DialogService.messageDialog)
     */
    it('shouldn\'t confirm a under payment', function() {
        // given
        angular.extend(scope.payments, sampleData.payments);
        scope.payments.pop();

        var payments = angular.copy(scope.payments);

        // when
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
        angular.extend(scope.payments, sampleData.payments);
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
        angular.extend(scope.payments, sampleData.payments);
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
        angular.extend(scope.payments, sampleData.payments);
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
