describe('Controller: PaymentOnCuffCtrlShoudOpenSpec\n', function() {

    var $rootScope = null;
    var DialogService = null;
    var OrderService = null;
    var OnCuffPaymentService = null;
    var scope = null;
    var dialogResolved = null;

    // load modules
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.ctrl');
    });

    // Mocks and stubs
    beforeEach(function() {
        // OrderService stub.
        OrderService = {};
        OrderService.order = {};
        OrderService.order.customerId = 1;

        // DialogService mock
        DialogService = {};

        // OnCuffPaymentService mock
        OnCuffPaymentService = {};
        OnCuffPaymentService.buildOnCuffRef = jasmine.createSpy('OnCuffPaymentService.buildOnCuffRef');
    });

    describe('Given a controller execution context\n', function() {

        describe('and a scope inherited negative total.change \n When the controller is instantiated \n Then', function() {
            beforeEach(inject(function($controller, _$rootScope_, $q) {
                $rootScope = _$rootScope_;

                scope = $rootScope.$new();
                // inherited from PaymentCtrl
                scope.total = {};
                scope.total.change = -150;
                scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');

                // DialogService mock
                DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

                PaymentOnCuffCtrl = $controller('PaymentOnCuffCtrl', {
                    $scope : scope,
                    DialogService : DialogService,
                    OrderService : OrderService,
                    OnCuffPaymentService : OnCuffPaymentService
                });
            }));

            it('should allow entrance', function() {
                expect(DialogService.messageDialog).not.toHaveBeenCalled();
                expect(scope.selectPaymentMethod).not.toHaveBeenCalled();
            });
        });

        describe('and a scope inherited zero total.change \n When the controller is instantiated \n Then', function() {
            beforeEach(inject(function($controller, _$rootScope_, $q) {
                $rootScope = _$rootScope_;

                scope = $rootScope.$new();
                // inherited from PaymentCtrl
                scope.total = {};
                scope.total.change = 0;
                scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');

                // DialogService mock
                DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

                PaymentOnCuffCtrl = $controller('PaymentOnCuffCtrl', {
                    $scope : scope,
                    DialogService : DialogService,
                    OrderService : OrderService,
                    OnCuffPaymentService : OnCuffPaymentService
                });
            }));

            it('should allow entrance', function() {
                expect(DialogService.messageDialog).not.toHaveBeenCalled();
                expect(scope.selectPaymentMethod).not.toHaveBeenCalled();
            });
        });

        describe('and a scope inherited positive total.change \n When the controller is instantiated \n Then', function() {
            beforeEach(inject(function($controller, _$rootScope_, $q) {
                $rootScope = _$rootScope_;

                scope = $rootScope.$new();
                // inherited from PaymentCtrl
                scope.total = {};
                scope.total.change = 150;
                scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');

                // DialogService mock
                DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog').andCallFake(function() {
                    var deferred = $q.defer();
                    dialogResolved = false;
                    setTimeout(function() {
                        deferred.resolve();
                        dialogResolved = true;
                    }, 0);
                    return deferred.promise;
                });

                PaymentOnCuffCtrl = $controller('PaymentOnCuffCtrl', {
                    $scope : scope,
                    DialogService : DialogService,
                    OrderService : OrderService,
                    OnCuffPaymentService : OnCuffPaymentService
                });
            }));

            it('shouldn\'t allow entrance', function() {
                waitsFor(function() {
                    $rootScope.$apply();
                    return dialogResolved;
                });
                runs(function() {
                    expect(DialogService.messageDialog).toHaveBeenCalledWith({
                        title : 'Contas a receber',
                        message : 'Não há saldo a receber neste pedido de venda.',
                        btnYes : 'OK'
                    });
                });
            });
        });
    });
});
