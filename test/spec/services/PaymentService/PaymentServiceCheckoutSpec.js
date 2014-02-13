describe('Service: PaymentServiceCheckout - Reserve', function() {

    var orderService = {};
    var entityService = {};
    var voucherService = {};
    var receivableService = {};
    var productReturnService = {};
    var stockKeeper = {};
    var smsService = {};
    var $q = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.service.coupon');

        module(function($provide) {
            $provide.value('OrderService', orderService);
            $provide.value('EntityService', entityService);
            $provide.value('VoucherService', voucherService);
            $provide.value('ReceivableService', receivableService);
            $provide.value('ProductReturnService', productReturnService);
            $provide.value('StockKeeper', stockKeeper);
            $provide.value('SMSService', smsService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_$q_, _PaymentService_) {
        PaymentService = _PaymentService_;
        $q = _$q_;
    }));

    // mocks
    beforeEach(function() {
        smsService.sendPaymentConfirmation = jasmine.createSpy('SMSService.sendPaymentConfirmation');

        entityService.list = jasmine.createSpy('EntityService.list').andReturn([
            {
                uuid : 1
            }
        ]);

        orderService.hasItems = jasmine.createSpy('OrderService.hasItems').andReturn(true);

        orderService.save = jasmine.createSpy('OrderService.save').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        receivableService.bulkRegister = jasmine.createSpy('ReceivableService.bulkRegister').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        productReturnService.bulkRegister = jasmine.createSpy('ProductReturnService.bulkRegister').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        voucherService.bulkProcess = jasmine.createSpy('VoucherService.bulkProcess').andCallFake(function() {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        });

        orderService.clear = jasmine.createSpy('OrderService.clear');
        stockKeeper.reserve = jasmine.createSpy('StockKeeper.reserve');

    });

    it('should reserve item', function() {

        // given
        orderService.order = {
            items : [
                {
                    id : 1,
                    qty : 1
                }
            ],
            customerId : 1
        };

        // when
        PaymentService.checkout(true, null);

        // then
        expect(stockKeeper.reserve).toHaveBeenCalledWith(1, 1);
    });

    it('should reserve multiple item', function() {

        // given
        orderService.order = {
            items : [
                {
                    id : 1,
                    qty : 1
                }, {
                    id : 2,
                    qty : 2
                }
            ],
            customerId : 1
        };

        // when
        PaymentService.checkout(true, null);

        // then
        expect(stockKeeper.reserve.calls[0].args[0]).toEqual(1);
        expect(stockKeeper.reserve.calls[0].args[1]).toEqual(1);
        expect(stockKeeper.reserve.calls[1].args[0]).toEqual(2);
        expect(stockKeeper.reserve.calls[1].args[1]).toEqual(2);
    });

    it('should reserve multiple item and ignore vouchers', function() {

        // given
        orderService.order = {
            items : [
                {
                    id : 1,
                    qty : 1
                }, {
                    id : 2,
                    qty : 2
                },{
                    id : 4,
                    qty : 2
                }, {
                    id : 3,
                    qty : 1,
                    type : 'coupon'
                }
            ],
            customerId : 1
        };

        // when
        PaymentService.checkout(true, null);

        // then
        expect(stockKeeper.reserve.calls[0].args[0]).toEqual(1);
        expect(stockKeeper.reserve.calls[0].args[1]).toEqual(1);
        expect(stockKeeper.reserve.mostRecentCall.args[0]).toEqual(4);
        expect(stockKeeper.reserve.mostRecentCall.args[1]).toEqual(2);

    });
    
    it('should not reserve', function() {

        // given
        orderService.order = {
            items : [
                {
                    id : 3,
                    qty : 1,
                    type : 'coupon'
                }
            ],
            customerId : 1
        };

        // when
        PaymentService.checkout(true, null);

        // then
        expect(stockKeeper.reserve).not.toHaveBeenCalled();

    });

});
