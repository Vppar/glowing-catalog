describe('Controller: PaymentCtrl', function() {
    var rootScope = {};
    var scope = {};
    var dp = {};
    var ds = {};
    var os = {};
    var ps = {};
    var sms = {};
    var ks = {};
    var location = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.filter.paymentType');
        module('tnt.catalog.filter.sum');
        module('tnt.utils.array');
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
        ks.getKeyboard = jasmine.createSpy('KeyboardService.getKeyboard');

        // OrdeService mock
        os.order = angular.copy(sampleData.orders[0]);
        os.save = jasmine.createSpy('OrderService.save').andCallFake(function() {
            var orderSaveReturn = angular.copy(sampleData.orderSaveReturn);
            dp.orders.push(orderSaveReturn);
            return orderSaveReturn;
        });
        os.clear = jasmine.createSpy('OrderService.clear');

        // PaymentService mock
        ps.list = jasmine.createSpy('PaymentService.list').andCallFake(function(value) {
            if (value == 'check') {
                return [
                    {
                        amount : 123.23

                    }
                ];

            } else if (value == 'creditCard') {
                return [
                    {
                        amount : 123.23

                    }, {
                        amount : 123.23

                    }, {
                        amount : 432.22

                    }
                ];

            } else if (value == 'exchange') {
                return [];

            } else if (value == 'coupon') {
                return [
                    {
                        amount : 421.22

                    }
                ];
            }
        });

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
            KeyboardService : ks,
            PaymentService : ps,
            SMSService : sms
        });
        $filter = _$filter_;
    }));

    it('should consolidate payment and order total when payment on cash change', function() {
        // given
        // when
        scope.total.payments.cash = 15.32;
        
        scope.$apply();

        // then
        expect(scope.total.change).toBe(297.45);
    });
    
    it('should consolidate payment and order total when selected screen change', function() {
        // given
        
        // when
        scope.selectPaymentMethod('none');

        // then
        expect(scope.total.change).toBe(282.13);
    });

    it('should update vouchers\' uniqueName when customer is changed', inject(function ($q) {
        var deferred = $q.defer();
        deferred.resolve(1);
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer').andReturn(deferred.promise);

        // given
        os.order.items = [
          {
            idx : 1,
            title : 'Vale Crédito',
            uniqueName : 'Foo',
            type : 'voucher',
            qty : 1,
            price : 500
          }
        ];

        scope.openDialogChooseCustomer();

        // Propagate promise resolution to 'then' functions using $apply()
        scope.$apply();

        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();
        expect(os.order.items[0].uniqueName).toBe('Robert Downey Jr.');
    }));

    /**
     * Given - a payments list (scope.payments) When - cancel payments is
     * request Then - warn the user about canceling the payment And - clear the
     * current payment (PaymentService.clear) And - redirect to the home screen
     * And - the payment data store should be left untouched
     * (DataProvider.payments)
     */
    xit('should cancel payment', function() {
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
     * Given - a payments list (scope.payments) When - confirm the payments is
     * request Then - save the order (OrderService.save) And - clear the current
     * order (OrderService.clear) And - save the payments with orderId and
     * customerId (PaymentService.save) And - clear the current payments
     * (OrderService.clear) And - link the payments to the order And - send a
     * SMS to warn the customer about his order
     * (SMSService.sendPaymentConfirmation) And - go to the home screen
     */
    xit('should confirm payment', function($rootScope) {
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
     * Given - a payment with amount greater then the order amount When - to
     * confirm payments is requested Then - the current payments should be left
     * untouched (scope.payments)
     */
    xit('shouldn\'t confirm an over payment', function() {
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
    });

    /**
     * Given - a payment with amount less then the order amount When - to
     * confirm payments is requested Then - the current payments should be left
     * untouched (scope.payments) And - the user should be warned with a dialog
     * (DialogService.messageDialog)
     */
    xit('shouldn\'t confirm a under payment', function() {
        // given
        angular.extend(scope.payments, sampleData.payments);
        scope.payments.pop();

        var payments = angular.copy(scope.payments);

        // when
        scope.confirm();
        rootScope.$apply();

        // leave the payment untouched.
        expect(payments).toEqual(scope.payments);
    });

    /**
     * Given - a list of payments When - confirm button is clicked Then - Make a
     * backup of the list And - redirect to order items
     */
    xit('should confirm all payments', function() {
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
     * Given - a list of payments And - the confirm button is clicked And - a
     * payment is removed When - cancel button is clicked Then - restore the
     * original list And - redirect to order items
     */
    xit('should undo payments after a payment be removed', function() {
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
     * Given - a list of payments And - the confirm button is clicked And - a
     * payment is added When - cancel button is clicked Then - restore the
     * original list And - redirect to order items
     */
    xit('should undo payments after a payment be removed', function() {
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
