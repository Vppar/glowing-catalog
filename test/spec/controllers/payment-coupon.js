describe('Controller: PaymentCouponCtrl', function() {
    var scope = {};
    var couponServiceMock = {};
    var DialogService = {};
    var log = {};

    var paymentServiceMock = {};

    var orderServiceMock = {};
    var DataProvider = {};

    var itemsMock = [];
    
    log.debug = angular.noop;

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.coupon');
        module('tnt.catalog.order.service');

        module(function($provide) {
            $provide.value('$log', log);
            $provide.value('OrderService', orderServiceMock);
        });
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {

        // Scope mock
        scope = $rootScope.$new();
        couponServiceMock.create = jasmine.createSpy('create');
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');
        scope.selectPaymentMethod = jasmine.createSpy('selectPaymentMethod');

        // fake a new order
        orderServiceMock.order = {};
        orderServiceMock.order.paymentIds = [];

        paymentServiceMock.persistedCoupons = {
            // amount : qty
            10 : 2
        };

        itemsMock = [
            {
                id : 0,
                title : 'Vale Crédito',
                uniqueName : '',
                amount : 55.00,
                qty : 1,
                type : 'voucher'
            }
        ];
        orderServiceMock.order.items = itemsMock;

        // orderServiceMock.order.items.push = jasmine.createSpy('push');
        scope.customer = {
            name : 'Mario'
        };
        scope.total = {
            change : 50
        };
        scope.coupon = {
            total : 0
        };
        log.error = jasmine.createSpy('$log.error');

        // Injecting into the controller
        $controller('PaymentCouponCtrl', {
            $scope : scope,
            CouponService : couponServiceMock,
            DialogService : DialogService,
            DataProvider : DataProvider,
            OrderService : orderServiceMock,
            PaymentService : paymentServiceMock
        });

    }));

    it('Should calculate totals - qty=5 ', function() {

        expect(scope.coupon.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 5;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(25);
        expect(scope.list[1].total).toEqual(50);
        expect(scope.list[2].total).toEqual(100);
        expect(scope.list[3].total).toEqual(150);
        expect(scope.coupon.total).toEqual(325);

    });

    it('Should calculate totals - qty=23. ', function() {

        expect(scope.coupon.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 23;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(115);
        expect(scope.list[1].total).toEqual(230);
        expect(scope.list[2].total).toEqual(460);
        expect(scope.list[3].total).toEqual(690);
        expect(scope.coupon.total).toEqual(1495);

    });

    it('should load coupons quantities from PaymentService.persistedCoupons', function() {
        // Should populate list based on paymentServiceMock.persistedCoupons.
        expect(scope.list[1].qty).toBe(2);
    });

    describe('confirmCoupons()', function() {
        // confirmCoupons should NOT create coupons anymore, just persist them
        // in PaymentService
        it('persists coupons in PaymentService', function() {
            paymentServiceMock.persistCouponQuantity = jasmine.createSpy('PaymentService.persistCouponQuantity');

            scope.list = [
                {
                    qty : 0,
                    amount : 5
                }, {
                    qty : 1,
                    amount : 10
                }, {
                    qty : 0,
                    amount : 20
                }, {
                    qty : 2,
                    amount : 30
                },
            ];

            scope.confirmCoupons();

            expect(paymentServiceMock.persistCouponQuantity).toHaveBeenCalled();
            expect(paymentServiceMock.persistCouponQuantity.calls.length).toBe(scope.list.length);
            expect(paymentServiceMock.persistCouponQuantity.calls[0].args).toEqual([5, 0]);
            expect(paymentServiceMock.persistCouponQuantity.calls[1].args).toEqual([10, 1]);
            expect(paymentServiceMock.persistCouponQuantity.calls[2].args).toEqual([20, 0]);
            expect(paymentServiceMock.persistCouponQuantity.calls[3].args).toEqual([30, 2]);
        });
    });

    it('should not create any coupon ', function() {
        scope.customer = {
            id : 1
        };

        scope.confirmCoupons();
        expect(couponServiceMock.create).not.toHaveBeenCalledWith();
        expect(scope.selectPaymentMethod).toHaveBeenCalledWith('none');
    });

    it('should not populate the item list of the order service with a voucher if the list does contains a voucher', function() {

        var value = 45.00;
        scope.option == 'option01';
        scope.voucher.total = value;

        scope.confirmVoucher();

        expect(orderServiceMock.order.items.length).toBe(1);
    });

    it('should  populate the item list of the order service with a voucher if the list does not contains a voucher', function() {

        items = [];

        var value = 100.00;
        scope.option == 'option01';
        scope.voucher.total = value;

        scope.confirmVoucher();
        expect(orderServiceMock.order.items.length).toBe(1);
    });

    it('should populate the item list of the order service with a giftcard', function() {

        // add a voucher to the order list
        var idx = orderServiceMock.order.items.length;

        var value = 10.00;
        var customerNameFake = 'Some Name';

        orderServiceMock.order.items.push = jasmine.createSpy('push');

        scope.gift.total = value;
        scope.gift.customer = {
            name : customerNameFake,
            uuid : 1
        };

        var gift = {
            id : idx,
            title : 'Vale Presente',
            uniqueName : customerNameFake,
            entity : 1,
            amount : value,
            qty : 1,
            type : 'giftCard'
        };

        scope.confirmGift();

        expect(orderServiceMock.order.items.push).toHaveBeenCalled();
        expect(orderServiceMock.order.items.push.mostRecentCall.args[0]).toEqual(gift);

    });

    it('should not allow to confirm if the voucher value is zero', function() {
        // empty order items
        orderServiceMock.order.items = [];

        scope.voucher.total = 0;
        scope.option = 'option01';
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(false);
    });

    // Allows to confirm with value 0 if there's an existing voucher
    it('allows to remove an existing voucher by setting the value to 0', function () {
        // If failing, make sure there's a voucher in OrderService.order.items
        scope.voucher.total = 0;
        scope.option = 'option01';
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);
    });

    it('should allow to confirm if the voucher value is different than zero', function() {
        scope.option = 'option01';
        scope.voucher.total = 40.25;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);

    });

    it('should allow to confirm if the voucher value is almost zero', function() {
        scope.option = 'option01';
        scope.voucher.total = 0.01;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);

    });

    it('should allow to confirm if the gift value is different than zero and customer is defined', function() {
        scope.option = 'option02';
        scope.gift.total = 20;
        scope.gift.customer = {
            name : 'A name'
        };
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);
    });

    it('should not allow to confirm if the gift value is zero', function() {
        scope.option = 'option02';
        scope.gift.total = 0;
        scope.gift.customer = {
          name : 'Anyname'
        };
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(false);
    });

    it('should not allow to confirm if the gift customer name is not defined', function() {
        scope.option = 'option02';
        scope.gift.total = 10;
        scope.gift.customer = undefined;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(false);

    });

    // If the user added coupons and, later, decides to remove them by
    // setting their quantity to 0, we should allow them to be removed.
    it('allows to confirm if total value of coupons is 0 and there are persisted coupons', function () {
        paymentServiceMock.hasPersistedCoupons = jasmine.createSpy('PaymentService.hasPersistedCoupons').andReturn(true);
        scope.option = 'option03';
        scope.coupon.total = 0;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);
    });


    it('should not allow to confirm if the total value of coupons is equals or less than zero', function() {
        // I'm not sure why, but I had to make this call to $apply() to get
        // rid of a previously defined value in scope.coupon.total that was
        // overriding (!?!?!) my new value.
        scope.$apply();
        paymentServiceMock.hasPersistedCoupons = jasmine.createSpy('PaymentService.hasPersistedCoupons').andReturn(false);
        scope.option = 'option03';
        scope.coupon.total = 0;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(false);
    });

    it('should allow to confirm if the total value of coupons is greater than zero', function() {
        scope.option = 'option03';
        scope.coupon.total = 80;
        scope.$apply();
        expect(scope.confirmEnabled).toEqual(true);
    });

    it('should populate the item list of the order service with a voucher', function() {

        var value = 45.00;
        scope.voucher.total = value;

        scope.confirmVoucher();

        expect(orderServiceMock.order.items.length).toBe(1);
        expect(orderServiceMock.order.items[0].amount).toBe(value);
    });

});
