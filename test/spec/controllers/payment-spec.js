describe('Controller: PaymentCtrl', function() {
    var rootScope = {};
    var scope = {};
    var dp = {};
    var ds = {};
    var os = {};
    var ps = {};
    var sms = {};
    var ks = {};
    var $q = {};
    var location = {};

    var fakePayments = {
      total : 0
    };

    var fakeOrder = {
      total : 0
    };

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.filter.paymentType');
        module('tnt.catalog.filter.sum');
        module('tnt.utils.array');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, _$q_, _$filter_, _$timeout_) {
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

        fakeOrder.total = 50;
        os.getOrderTotal = jasmine.createSpy('OrderService.getOrderTotal').andCallFake(function () {
          return fakeOrder.total;
        });
        os.getItemsQuantity = jasmine.createSpy('OrderService.getItemsQuantity');
        os.getItemsCount = jasmine.createSpy('OrderService.getItemsCount');


        fakePayments.total = 55;
        ps.getTotal = jasmine.createSpy('PaymentService.getTotal').andCallFake(function () {
          return fakePayments.total;
        });

        ps.getPaymentCount = jasmine.createSpy('PaymentService.getPaymentCount');
        ps.getChange = jasmine.createSpy('PaymentService.getChange');
        ps.getRemainingAmount = jasmine.createSpy('PaymentService.getRemainingAmount');

        // PaymentService mock
        ps.list = jasmine.createSpy('PaymentService.list').andCallFake(function(value) {
            if (value == 'check' || value == 'cash') {
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
        ps.clear = jasmine.createSpy('PaymentService.clear');
        ps.clearAllPayments = jasmine.createSpy('PaymentService.clearAllPayments');
        ps.add = jasmine.createSpy('PaymentService.add');

        // Scope mock
        rootScope = $rootScope;
        scope = $rootScope.$new();
        spyOn(scope, '$broadcast');

        // SMSService mock
        sms.sendPaymentConfirmation =
                jasmine.createSpy('SMSService.sendPaymentConfirmation')
                        .andReturn(angular.copy(sampleData.smsSendPaymentConfirmationReturn));
        $q = _$q_;
        $timeout = _$timeout_;
        // Injecting into the controller
        $controller('PaymentCtrl', {
            $scope : scope,
            $location : location,
            $q : _$q_,
            DataProvider : dp,
            DialogService : ds,
            OrderService : os,
            KeyboardService : ks,
            PaymentService : ps,
            SMSService : sms,
            $filter : _$filter_
        });
        $filter = _$filter_;
    }));


    // This test should check if PaymentService.createCoupons is being called
    // when the order is confirmed.
    it('should create coupons when payment is confirmed', inject(function ($q) {
        var deferred = $q.defer();
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog').andReturn(deferred.promise);
        os.save = jasmine.createSpy('OrderService.save').andReturn(deferred.promise);
        ps.createCoupons = jasmine.createSpy('PaymentService.createCoupons').andReturn([]);
        ps.clearPersistedCoupons = jasmine.createSpy('PaymentService.createCoupons');
        ps.remove = function () {};
        ps.clear = function () {};

        // when
        scope.confirm();
        deferred.resolve(true);
        scope.$apply();

        expect(ps.createCoupons).toHaveBeenCalled();
    }));

    it('should update vouchers uniqueName when customer is changed', inject(function($q) {
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
     * When I change the customer in the payment screen, this change should be
     * propagated to the order, making the change final.
     */
    it('should update order\'s customer when the customer changes', inject(function($q) {
        var deferred = $q.defer();
        deferred.resolve(1);
        ds.openDialogChooseCustomer = jasmine.createSpy('DialogService.openDialogChooseCustomer').andReturn(deferred.promise);

        scope.openDialogChooseCustomer();

        // Propagate promise resolution to 'then' functions using $apply()
        scope.$apply();

        expect(ds.openDialogChooseCustomer).toHaveBeenCalled();
        expect(os.order.customerId).toBe(1);
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


    describe('PaymentCtrl.changedValues event', function () {
      it('should be triggered on PaymentService.paymentsChanged', function () {
        rootScope.$broadcast('PaymentService.paymentsChanged');
        expect(scope.$broadcast).toHaveBeenCalledWith('PaymentCtrl.valuesChanged');
      });

      it('should be triggered on OrderService.orderItemsChanged', function () {
        rootScope.$broadcast('OrderService.orderItemsChanged');
        expect(scope.$broadcast).toHaveBeenCalledWith('PaymentCtrl.valuesChanged');
      });

      // FIXME: couldn't get values to be updated in the scope...
      // @see os.getOrderTotal and ps.getPaymentsTotal in the top of the file
      // @see next test ('clears onCuff payments if values change')
      xit('updates totals', function () {
        fakePayments.total = 100;
        fakeOrder.total = 120;
        expect(scope.$broadcast).not.toHaveBeenCalledWith('PaymentCtrl.valuesChanged');
        rootScope.$broadcast('PaymentService.paymentsChanged');
        expect(scope.$broadcast).toHaveBeenCalledWith('PaymentCtrl.valuesChanged');
        scope.$apply();
        expect(scope.totals.payments.total).toBe(100);
        expect(scope.totals.order.total).toBe(120);
      });

      // FIXME: since this test needs to update scope.totals.payments.change or
      // scope.totals.paymens.remaining to a given value, it suffers the same problem
      // as the previous test. Whoever implements a valid test in the previous case,
      // please, implement this too.
      xit('clears onCuff payments if values change');
    });
});
