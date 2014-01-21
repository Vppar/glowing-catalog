describe('Controller: PaymentExchangeCtrlConfirm', function() {

    var DialogService = {};
    var scope = {};
    var InventoryKeeper = {};
    var ArrayUtils = {};
    var PaymentService = {};
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.payment.service');
    });

    beforeEach(function() {
        InventoryKeeper.read = jasmine.createSpy('read');
        PaymentService.add = jasmine.createSpy('add');
        PaymentService.clear = jasmine.createSpy('clear');
        PaymentService.list = jasmine.createSpy('list');

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
        scope.exchanges = [];
        var exc = {};
        exc.amount = 30;
        exc.qty = 2;
        exc.amountunit = 15;
        exc.title = 'test product';
        exc.id = 1;
        scope.exchanges.push(exc);

        var expected = {
            qty : 2,
            productId : 1,
            amount : 30
        };

        // when
        scope.confirmExchangePayments();

        // then
        expect(PaymentService.add).toHaveBeenCalledWith(expected);
    });

    it('should clear old exchanges before add confirmed exchanges', function() {
        // given
        scope.exchanges = [];
        var exc = {};
        exc.amount = 30;
        exc.qty = 2;
        exc.amountunit = 15;
        exc.title = 'test product';
        exc.id = 1;
        scope.exchanges.push(exc);

        // when
        scope.confirmExchangePayments();

        // then
        expect(PaymentService.clear).toHaveBeenCalled();
    });
});