describe('Controller: PaymentCheckCtrlConfirmChecks', function() {

    var scope = {};
    var element = {};
    var paymentService = {};
    var os = {};
    var es = {};
    var rs = {};
    var prs = {};
    var vs = {};
    var sk = {};
    var sms = {};
    var BookService = {};

    beforeEach(function() {
        module('tnt.catalog.payment.check');
        module('tnt.catalog.filter.findBy');
        module('tnt.catalog.order.service');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.service.data');
        module('tnt.catalog.inventory.entity');
        module('tnt.catalog.filter.sum');
        module('tnt.catalog.filter.paymentType');
        module('tnt.catalog.misplaced.service');

        module(function($provide) {
            $provide.value('OrderService', os);
            $provide.value('EntityService', es);
            $provide.value('ReceivableService', rs);
            $provide.value('ProductReturnService', prs);
            $provide.value('VoucherService', vs);
            $provide.value('StockKeeper', sk);
            $provide.value('SMSService', sms);
            $provide.value('BookService', BookService);
        });
    });
    beforeEach(inject(function($controller, $rootScope, _$filter_, $q, Misplacedservice) {
        // scope mock
        scope = $rootScope.$new();

        scope.total = {
            change : 0
        };

        // dialog service mock
        scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');
        paymentService.clear = jasmine.createSpy('PaymentService.clear');
        paymentService.add = jasmine.createSpy('PaymentService.add');
        paymentService.list = jasmine.createSpy('PaymentService.list');
        $controller('PaymentCheckCtrl', {
            $scope : scope,
            $element : element,
            PaymentService : paymentService
        });
    }));

    it('should confirm the payments', function() {
        // given
        // list of payment in the before each
        angular.extend(scope.check, sampleData.payment.check);
        scope.payments = sampleData.payment.check;

        scope.confirmCheckPayments();

        expect(scope.selectPaymentMethod).toHaveBeenCalled();
        expect(paymentService.clear).toHaveBeenCalled();
        expect(paymentService.add).toHaveBeenCalled();
    });
});
