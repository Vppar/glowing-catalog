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
        
      //fake a new order
        orderServiceMock.order = {};
        orderServiceMock.order.paymentIds = [];
        orderServiceMock.order.items = [];
        orderServiceMock.order.items.push =  jasmine.createSpy('push');
        
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
        
        //add a voucher to the order list 
        var idx = orderServiceMock.order.items.length;
        
        scope.coupon.total = 45.00;
        
        var voucher = {
                idx: idx,
                title: 'An title!',
                uniqueName:'an unique name!',
                price: scope.coupon.total,
                qty:1
        };

        scope.confirmVoucher();
        
        expect(orderServiceMock.order.items.push).toHaveBeenCalled();
        expect(orderServiceMock.mostRecentCall.args[0]).toEqual(voucher);
        
    });
    

});
