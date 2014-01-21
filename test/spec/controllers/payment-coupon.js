describe('Controller: PaymentCouponCtrl', function() {
    var scope = {};
    var couponServiceMock = {};
    var DialogService = {};
    var log = {};

    var orderServiceMock = {};
    var DataProvider = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.coupon');

        module(function($provide) {
            $provide.value('$log', log);
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
        orderServiceMock.order.items = [];
        orderServiceMock.order.items.push = jasmine.createSpy('push');

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
            OrderService : orderServiceMock
        });

    }));

    it('Should calculate totals - qty=5 ', function() {

        expect(scope.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 5;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(25);
        expect(scope.list[1].total).toEqual(50);
        expect(scope.list[2].total).toEqual(100);
        expect(scope.list[3].total).toEqual(150);
        expect(scope.total).toEqual(325);

    });

    it('Should calculate totals - qty=23. ', function() {

        expect(scope.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 23;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(115);
        expect(scope.list[1].total).toEqual(230);
        expect(scope.list[2].total).toEqual(460);
        expect(scope.list[3].total).toEqual(690);
        expect(scope.total).toEqual(1495);

    });

    it('should create 3 coupons ', function() {
        scope.customer = {
            id : 1
        };
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

        expect(couponServiceMock.create).not.toHaveBeenCalledWith(scope.customer.id, scope.list[0].amount);
        expect(couponServiceMock.create).toHaveBeenCalledWith(scope.customer.id, scope.list[1].amount);
        expect(couponServiceMock.create).not.toHaveBeenCalledWith(scope.customer.id, scope.list[2].amount);
        expect(couponServiceMock.create).toHaveBeenCalledWith(scope.customer.id, scope.list[3].amount);
        expect(scope.selectPaymentMethod).toHaveBeenCalledWith('none');
    });

    it('should log a fatal error', function() {
        couponServiceMock.create = jasmine.createSpy('create').andCallFake(function() {
            throw 'Coupon not created';
        });

        log.fatal = jasmine.createSpy('fatal').andCallFake(function() {
        });

        var errorMessage = 'Ocorreram erros na geração dos cupons. Na próxima sincronização do sistema um administrador será acionado.';

        scope.customer = {
            id : 1
        };

        var dialog = {
            title : 'Cupom Promocional',
            message : errorMessage,
            btnYes : 'OK'
        };

        scope.list = [
            {
                qty : 1,
                amount : 5
            }, {
                qty : 1,
                amount : -10
            }, {
                qty : 0,
                amount : 20
            }, {
                qty : 0,
                amount : 30
            },
        ];
        var confirmCouponsCall = function() {
            scope.confirmCoupons();
        };
        expect(confirmCouponsCall).not.toThrow();
        expect(DialogService.messageDialog).toHaveBeenCalledWith(dialog);
        expect(couponServiceMock.create).toHaveBeenCalledWith(scope.customer.id, scope.list[0].amount);
        expect(couponServiceMock.create).toHaveBeenCalledWith(scope.customer.id, scope.list[1].amount);
        expect(log.fatal).toHaveBeenCalled();
    });

    it('should not create any coupon ', function() {
        scope.customer = {
            id : 1
        };

        scope.confirmCoupons();
        expect(couponServiceMock.create).not.toHaveBeenCalledWith();
        expect(scope.selectPaymentMethod).toHaveBeenCalledWith('none');
    });

    it('should populate the item list of the order service with a voucher', function() {

        // add a voucher to the order list
        var idx = orderServiceMock.order.items.length;

        var value = 45.00;
        scope.option == 'option01';
        scope.voucher.total = value;

        var voucher = {
            idx : idx,
            title : 'Vale Crédito',
            uniqueName : '',
            price : value,
            qty : 1
        };

        scope.confirmVoucher();

        expect(orderServiceMock.order.items.push).toHaveBeenCalled();
        expect(orderServiceMock.order.items.push.mostRecentCall.args[0]).toEqual(voucher);

    });

    it('should populate the item list of the order service with a giftcard', function() {

        // add a voucher to the order list
        var idx = orderServiceMock.order.items.length;

        var value = 10.00;
        var customerNameFake = 'Some Name';

        scope.gift.total = value;
        scope.gift.customer = {
            name : customerNameFake
        };

        var gift = {
            idx : idx,
            title : 'Vale Presente',
            uniqueName : 'para ' + customerNameFake,
            price : value,
            qty : 1
        };

        scope.confirmGift();

        expect(orderServiceMock.order.items.push).toHaveBeenCalled();
        expect(orderServiceMock.order.items.push.mostRecentCall.args[0]).toEqual(gift);

    });

    it('should not allow to confirm if the voucher value is zero', function() {

        var value = 0;
        scope.voucher.total = value;
        scope.option = 'option01';

        scope.$apply();

        expect(scope.isDisabled).toEqual(true);

    });

    it('should allow to confirm if the voucher value is different than zero', function() {

        scope.option = 'option01';

        scope.$apply();

        var value = 40.25;
        scope.voucher.total = value;

        scope.$apply();

        expect(scope.isDisabled).toEqual(false);

    });

    it('should allow to confirm if the voucher value is almost zero', function() {

        scope.option = 'option01';
        scope.$apply();

        var value = 0.01;
        scope.voucher.total = value;

        scope.$apply();

        expect(scope.isDisabled).toEqual(false);

    });

    it('should allow to confirm if the gift value is different than zero and customer is defined', function() {

        scope.option = 'option02';

        scope.$apply();

        var value = 40.25;
        scope.gift.total = value;

        scope.gift.customer = {
            name : 'A name'
        };
        
        scope.$apply();

        expect(scope.isDisabled).toEqual(false);

    });

    it('should not allow to confirm if the gift value is zero', function() {

        var value = 0;
        scope.gift.total = value;

        scope.$apply();

        expect(scope.isDisabled).toEqual(true);

    });

    it('should not allow to confirm if the gift customer name is not defined', function() {

        var value = 25;
        scope.gift.total = value;

        scope.$apply();
        expect(scope.isDisabled).toEqual(true);

    });

});
