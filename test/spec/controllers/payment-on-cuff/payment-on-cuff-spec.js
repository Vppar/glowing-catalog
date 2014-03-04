describe('Controller: PaymentOnCuffCtrl\n', function() {

    var DialogService = null;
    var OrderService = null;
    var OnCuffPaymentService = null;

    var scope = null;

    var buildOnCufRefReturn = null;
    var fakeNow = null;

    // load modules
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.ctrl');
    });

    // Mocks and stubs
    beforeEach(function() {
        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;

        // Date mock
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        spyOn(Date.prototype, 'setHours');
        spyOn(Date.prototype, 'setMinutes');
        spyOn(Date.prototype, 'setSeconds');

        // OrderService stub.
        OrderService = {};
        OrderService.order = {};
        OrderService.order.customerId = 1;

        // DialogService mock
        DialogService = {};
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        // OnCuffPaymentService stub.
        buildOnCufRefReturn = {
            stub : 'i\'m a stub'
        };
        
        OnCuffPaymentService = {};
        OnCuffPaymentService.buildOnCuffRef = jasmine.createSpy('OnCuffPaymentService.buildOnCuffRef').andReturn(buildOnCufRefReturn);
    });

    describe('Given a controller execution context\n', function() {
        beforeEach(inject(function($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            spyOn(scope, '$watch').andCallThrough();

            // inherited from PaymentCtrl
            scope.total = {};
            scope.total.change = -1;

            PaymentOnCuffCtrl = $controller('PaymentOnCuffCtrl', {
                $scope : scope,
                DialogService : DialogService,
                OrderService : OrderService,
                OnCuffPaymentService : OnCuffPaymentService
            });

        }));

        describe('When the controller is instantiated \n Then', function() {

            it('should have shouldOpen function', function() {
                expect(typeof PaymentOnCuffCtrl.shouldOpen === 'function').toBe(true);
            });
            
            it('should have shouldOpen function', function() {
                expect(typeof PaymentOnCuffCtrl.buildInstallments === 'function').toBe(true);
            });

            it('should have numberOfInstallmentsWatcherCallback function', function() {
                expect(typeof PaymentOnCuffCtrl.numberOfInstallmentsWatcherCallback === 'function').toBe(true);
            });

            it('should have duedateWatcherCallback function', function() {
                expect(typeof PaymentOnCuffCtrl.duedateWatcherCallback === 'function').toBe(true);
            });

            it('should have recalcInstallments function in scope', function() {
                expect(typeof scope.recalcInstallments === 'function').toBe(true);
            });

            it('should have confirmOnCuffPayment function in scope', function() {
                expect(typeof scope.confirmOnCuffPayment === 'function').toBe(true);
            });

            it('should have onCuff variable in scope', function() {
                expect(OnCuffPaymentService.buildOnCuffRef).toHaveBeenCalledWith(-scope.total.change, OrderService.order.customerId);
                expect(scope.onCuff).toBe(buildOnCufRefReturn);
            });

            it('should have TODAY variable in scope', function() {
                expect(scope.TODAY.getTime()).toBe(fakeNow);
                expect(Date.prototype.setHours).toHaveBeenCalledWith(0);
                expect(Date.prototype.setMinutes).toHaveBeenCalledWith(0);
                expect(Date.prototype.setSeconds).toHaveBeenCalledWith(0);
            });

            it('should have a watcher on onCuff.duedate', function() {
                expect(scope.$watch).toHaveBeenCalledWith(
                        'onCuff.numberOfInstallments', PaymentOnCuffCtrl.numberOfInstallmentsWatcherCallback);
            });

            it('should have a watcher on onCuff.duedate', function() {
                expect(scope.$watch).toHaveBeenCalledWith('onCuff.duedate', PaymentOnCuffCtrl.duedateWatcherCallback);
            });
        });
    });

});
