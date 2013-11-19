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
        os.save = jasmine.createSpy('OrderService.save').andReturn({
            id : 1,
            customerId : 1,
            paymentIds : []
        });
        os.clear = jasmine.createSpy('OrderService.clear');

        // PaymentService mock
        ps.payments = angular.copy(sampleData.payments);
        ps.save = jasmine.createSpy('PaymentService.save').andReturn([
            {
                id : 1
            }, {
                id : 2
            }, {
                id : 3
            }
        ]);
        ps.clear = jasmine.createSpy('PaymentService.clear');

        // Scope mock
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.payments = angular.copy(sampleData.payments);

        // SMSService mock
        sms.sendPaymentConfirmation = jasmine.createSpy('SMSService.sendPaymentConfirmation').andReturn({
            then : function(method) {
                return method();
            }
        });

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
        // leave the payments list untouched.
        expect(dp.payments).toEqual(payments);
        // go home.
        expect(ps.clear).toHaveBeenCalled();
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

});
