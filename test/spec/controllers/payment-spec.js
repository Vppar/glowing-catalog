// FIXME Needs to be rewritten due to the implementation of the discount logic
//
// There's an old implementation of tests for PaymentCtrl further down in
// this file. It was already commented and I've left it there for now, until
// someone checks whats wrong with it.
xdescribe('PaymentCtrl', function () {
  // Dependencies
  var
    $rootScope,
    $scope,
    $filter,
    $location,
    $q,
    $log,
    ArrayUtils,
    DataProviderMock,
    DialogServiceMock,
    OrderServiceMock,
    PaymentServiceMock,
    SMSServiceMock,
    KeyboardServiceMock,
    InventoryKeeperMock,
    CashPayment,
    EntityServiceMock,
    UserServiceMock,
    MisplacedServiceMock;

  var PaymentCtrl;

  var showLogs = false;

  var logger = showLogs ? console.log : angular.noop;

  $log = {
    debug : logger,
    error : logger,
    fatal : logger,
    warn : logger
  };


  beforeEach(createMocks);
  beforeEach(loadModules);
  beforeEach(inject(injectDependencies));
  beforeEach(createSpies);
  // Don't call initController() here, but inside each describe, allowing
  // to change the order and payments before initializing the controller.


  describe('total discount', function () {
    var item1, item2, item3, items;

    beforeEach(function () {
      item1 = {qty : 1, price : 10, discount : 1};
      item2 = {qty : 2, price : 20, discount : 2};
      item3 = {qty : 3, price : 30, discount : 3};
      items = [item1, item2, item3];

      OrderServiceMock.order.items = items;
    });

    beforeEach(initController);


    it('is calculated when the controller is loaded', function () {
      expect($scope.total.order.discount).not.toBe(0);
    });


    it('is the sum of the discount given for each product in the order',
      function () {
        var totalDiscount = 0;

        for (var idx in items) {
          totalDiscount += items[idx].discount;
        }

        expect($scope.items).toBe(items);
        expect($scope.total.order.discount).toBe(totalDiscount);
      });


    it('is distributed accross all products when changed', function () {
      $scope.total.order.discount = 70;
      $scope.$apply();

      var orderTotal = $scope.total.order.amount;
      var discountTotal = $scope.total.order.discount;
      var orderItems = items;

      expect(MisplacedServiceMock.distributeDiscount).toHaveBeenCalledWith(orderTotal, discountTotal, orderItems);
    });
  }); // total discount




  describe('order subtotal', function () {
    var orderTotal = 50;
    var order;
    var total;

    beforeEach(initController);

    beforeEach(function () {
      total = $scope.total;
      order = total.order;

      order.amount = orderTotal;
      $scope.$apply();

      // Make sure we always have the expected subTotal
      expect(order.subTotal).toBe(orderTotal);
    });


    it('is updated when the order total changes', function () {
      var newOrderTotal = 100;

      order.amount = newOrderTotal;
      $scope.$apply();

      expect(order.subTotal).toBe(newOrderTotal);
    });


    it('is updated when order discount changes', function () {
      order.discount = 25;
      $scope.$apply();

      expect(order.subTotal).toBe(order.amount - order.discount);
    });


    it('is updated when exchanged products total changes', function () {
      total.paymentsExchange = 25;
      $scope.$apply();

      expect(order.subTotal).toBe(order.amount - total.paymentsExchange);
    });


    it('subtracts discount and total exchanges from order amount', function () {
      order.discount = 10;
      total.paymentsExchange = 15;
      $scope.$apply();

      expect(order.subTotal).toBe(order.amount - order.discount - total.paymentsExchange);
    });
  }); // order subtotal





  ///////////////////////////////////////////////
  // Initialization functions
  ///////////////////////////////////////////////
  // Functions that initialize the module/controller and its dependencies.

  function createMocks() {
    DataProviderMock = {};
    DialogServiceMock = {};
    OrderServiceMock = {};
    PaymentServiceMock = {};
    SMSServiceMock = {};
    KeyboardServiceMock = {};
    InventoryKeeperMock = {};
    EntityServiceMock = {};
    UserServiceMock = {};
    MisplacedServiceMock = {};
  }


  function loadModules() {
    module('tnt.catalog.payment');
    module('tnt.catalog.filter.findBy');
    module('tnt.catalog.filter.paymentType');
    module('tnt.catalog.filter.sum');
  }


  function injectDependencies(
    _$controller_,
    _$q_,
    _$rootScope_,
    _$filter_,
    _$location_,
    _ArrayUtils_,
    _CashPayment_
  ) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $filter = _$filter_;
    $location = _$location_;
    ArrayUtils = _ArrayUtils_;
    CashPayment = _CashPayment_;
  }


  function createSpies() {
    EntityServiceMock.list = jasmine.createSpy('EntityService.list').andReturn([{
      uuid : 1,
      name : 'Fake Entity'
    }]);

    KeyboardServiceMock.getKeyboard = jasmine.createSpy('KeyboardService.getKeyboard');

    MisplacedServiceMock.distributeDiscount = jasmine.createSpy('Misplacedservice.distributeDiscount');

    MisplacedServiceMock.discount = {
        getTotalOrderDiscount : jasmine.createSpy('getTotalOrderDiscount()'),
        getTotalItemDiscount : jasmine.createSpy('getTotalItemDiscount()'),
        getTotalDiscount : jasmine.createSpy('getTotalDiscount()'),
        distributeItemDiscount : jasmine.createSpy('distributeItemDiscount'),
        distributeOrderDiscount : jasmine.createSpy('distributeOrderDiscount'),
        _getItemTotal : jasmine.createSpy('_getItemTotal'),
        _getItemsTotal : jasmine.createSpy('_getItemsTotal')
    };

    OrderServiceMock.order = {
      customerId : 1
    };

    PaymentServiceMock.list = jasmine.createSpy('PaymentService.list').andReturn([]);
    PaymentServiceMock.clear = jasmine.createSpy('PaymentService.clear');

    UserServiceMock.redirectIfIsNotLoggedIn = jasmine.createSpy('UserService.redirectIfIsNotLoggedIn');
  }


  function initController() {
    PaymentCtrl = $controller('PaymentCtrl', {
      $scope : $scope,
      $location : $location,
      $filter : $filter,
      $q : $q,
      $log : $log,
      ArrayUtils : ArrayUtils,
      DataProvider : DataProviderMock,
      DialogService : DialogServiceMock,
      OrderService : OrderServiceMock,
      PaymentService : PaymentServiceMock,
      SMSService : SMSServiceMock,
      KeyboardService : KeyboardServiceMock,
      InventoryKeeper : InventoryKeeperMock,
      CashPayment : CashPayment,
      EntityService : EntityServiceMock,
      UserService : UserServiceMock,
      Misplacedservice : MisplacedServiceMock
    });
  }


}); // PaymentCtrl





//////////////////////////////////////////////////////////////
// Old test implementation
/////////////////////////////////////////////////////////////
// This tests were already commented out. I've decided to
// not work on top of a code in need of review...

// FIXME - This whole suit test needs review
xdescribe('Controller: PaymentCtrl', function() {
    var rootScope = {};
    var scope = {};
    var dp = {};
    var ds = {};
    var os = {};
    var ps = {};
    var rs = {};
    var vs = {};
    var sms = {};
    var ks = {};
    var $q = {};
    var location = {};
    var productReturnServiceMock = {};
    var es = {};

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
        
        // EntityService mock
        // es.list = function(){return angular.copy(sampleData.customers)};

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
        os.hasItems = jasmine.createSpy('OrderService.hasItems');

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
        ps.getReceivables = jasmine.createSpy('PaymentService.getReceivables');
        ps.hasPersistedCoupons = jasmine.createSpy('PaymentService.hasPersistedCoupons');


        // ReceivableService mock
        rs.bulkRegister = jasmine.createSpy('ReceivableService.bulkRegister');
        rs.list = jasmine.createSpy('ReceivableService.list');
        
        // ProductReturnService mock
        productReturnServiceMock.bulkRegister = jasmine.createSpy('ProductReturnService.bulkRegister');
        productReturnServiceMock.list = jasmine.createSpy('ProductReturnService.list');
        // Scope mock
        rootScope = $rootScope;
        scope = $rootScope.$new();

        // VoucherService mock
        vs.bulkRegister = jasmine.createSpy('VoucherService.bulkRegister');
        vs.list = jasmine.createSpy('VoucherService.list');

		// EntityService Mock
        es.list = jasmine.createSpy('EntityService.list').andReturn([{uuid: 1, name: 'Robert Downey Jr.'}]);
        
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
            ReceivableService : rs,
            ProductReturnService: productReturnServiceMock,
            VoucherService : vs,
            EntityService: es
        });
        $filter = _$filter_;
    }));


    // This test should check if PaymentService.createCoupons is being called
    // when the order is confirmed.
    it('should create coupons when payment is confirmed', inject(function ($q) {
        var deferred = $q.defer();
        var savedCouponsPromise = $q.defer();
        savedCouponsPromise.resolve([{amount : 10}]);
        ds.messageDialog = jasmine.createSpy('DialogService.messageDialog').andReturn(deferred.promise);
        os.save = jasmine.createSpy('OrderService.save').andReturn(deferred.promise);
        ps.createCoupons = jasmine.createSpy('PaymentService.createCoupons').andReturn(savedCouponsPromise.promise);
        ps.clearPersistedCoupons = jasmine.createSpy('PaymentService.createCoupons');
        ps.hasPersistedCoupons.andReturn(true);
        ps.remove = function () {};
        ps.clear = function () {};

        // when
        scope.confirm();
        deferred.resolve(true);
        scope.$apply();

        expect(ps.createCoupons).toHaveBeenCalled();
    }));

    it('should consolidate payment and order total when payment on cash change', function() {
        // given
        scope.cash.amount = 123.23;
        // when
        scope.$apply();

        // then
        expect(scope.total.change).toBe(405.36);
    });

    it('should consolidate payment and order total when selected screen change', function() {
        // given

        // when
        scope.selectPaymentMethod('none');

        // then
        expect(scope.total.change).toBe(405.36);
    });

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
    
    it('should recalculate the change amount', function() {
        // given
        dp.products = [
            {
                id : 13,
                parent : 14
            }, {
                id : 14
            }
        ];
        scope.order = os.order;
        
        ds.openDialogAddToBasket = jasmine.createSpy('DialogService.openDialogAddToBasket').andCallFake(function(input) {
            os.order.items[2].qty = 2;
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        // when
        scope.addToBasket(dp.products[0]);

        scope.$apply();

        // then
        expect(ds.openDialogAddToBasket).toHaveBeenCalled();
        expect(scope.total.change).toBe(575.36);
    });

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
});
