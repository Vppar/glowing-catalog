describe('Controller: PaymentExchangeCtrlConfirm', function() {

    var DialogService = {};
    var scope = {};
    var InventoryKeeper = {};
    var ArrayUtils = {};
    var PaymentService = {};
    var exchanges = [];

    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.payment.service');
    });

    beforeEach(function() {
        exchanges.length = 0;

        InventoryKeeper.read = jasmine.createSpy('read');
        PaymentService.add = jasmine.createSpy('add');
        PaymentService.clear = jasmine.createSpy('clear');
        PaymentService.list = jasmine.createSpy('PaymentService.list').andReturn(exchanges);
    });

    beforeEach(inject(function($controller, $rootScope) {

        scope = $rootScope.$new();
        scope.selectPaymentMethod = function() {
        };

        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            DialogService : DialogService,
            InventoryKeeper : InventoryKeeper,
            ArrayUtils : ArrayUtils,
            PaymentService : PaymentService
        });
    }));

    it('should add exchanges to payment exchanges', function() {
        // given
        var exc = {};
        exc.amount = 30;
        exc.price = 15;
        exc.qty = 2;
        exc.title = 'test product';
        exc.id = 1;
        exc.productId = 1;
        exchanges.push(exc);

        // when
        scope.confirmExchangePayments();
        
        // then
        expect(PaymentService.add).toHaveBeenCalledWith(exc);
    });

    it('should clear old exchanges before add confirmed exchanges', function() {
        // given
        var exc = {};
        exc.amount = 30;
        exc.qty = 2;
        exc.amountunit = 15;
        exc.title = 'test product';
        exc.productId = 1;
        exc.id = 1;

        scope.exchanges.push(exc);

        // when
        scope.confirmExchangePayments();

        // then
        expect(PaymentService.clear).toHaveBeenCalled();
    });
});