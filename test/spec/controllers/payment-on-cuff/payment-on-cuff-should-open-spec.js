// FIXME - This whole suit test needs review
xdescribe('Controller: PaymentOnCuffCtrlShoudOpenSpec\n', function() {

    var scope = {};
    var DialogService = {};
    var OrderService = {};
    var OnCuffPaymentService = {};
    var $q = {};

    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.ctrl');
    });

    beforeEach(inject(function($controller, $rootScope, _$q_) {
        // scope mock
        scope = $rootScope.$new();
        scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');

        scope.total = {};
        scope.total.change = 284;

        scope.selectPaymentMethod = jasmine.createSpy(scope.selectPaymentMethod);

        $q = _$q_;

        // mock the DialogSevice.messageDialog beahavior.
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(function() {
            var defer = $q.defer();
            setTimeout(function() {
                defer.resolve();
            }, 0);
            return defer.promise;
        });

        // reproduce the scope inheritance
        $controller('PaymentOnCuffCtrl', {
            $scope : scope,
            DialogService : DialogService,
            OrderService : OrderService,
            OnCuffPaymentService : OnCuffPaymentService
        });
    }));

    decribe('should create 1 installment', function() {
        // given
        scope.amount = 500;
        scope.dueDate = new Date();
        scope.installmentQty = 1;
        scope.payments = [];
        scope.computeInstallments();

        var expectedDate = scope.dueDate;

        expect(scope.payments.length).toEqual(1);
        expect(scope.payments[0].amount).toEqual(scope.amount);
        expect(new Date(scope.payments[0].dueDate)).toEqual(expectedDate);
    });

    
});
