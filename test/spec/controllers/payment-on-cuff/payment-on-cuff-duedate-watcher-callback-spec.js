'use strict';

describe('Controller: PaymentOnCuffCtrlDuedateWatcherCallBackSpec\n', function() {

    var DialogService = null;
    var OrderService = null;
    var OnCuffPaymentService = null;
    var PaymentOnCuffCtrl = null;

    var scope = null;
    var fakeNow = null;

    var buildInstallmentsReturn = null;
    var buildOnCuffRefReturn = null;

    // load modules
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.ctrl');
    });

    // Mocks and stubs
    beforeEach(function() {
        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        // OrderService stub.
        OrderService = {};
        OrderService.order = {};
        OrderService.order.customerId = 1;

        // DialogService mock
        DialogService = {};
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        // OnCuffPaymentService stub.
        buildInstallmentsReturn = {
            stub : 'i\'m an installments stub'
        };
        buildOnCuffRefReturn = {
            installments : 'i\'m a onCuffRef stub'
        };

        OnCuffPaymentService = {};
        OnCuffPaymentService.buildInstallments =
                jasmine.createSpy('OnCuffPaymentService.buildInstallments').andReturn(buildInstallmentsReturn);
        OnCuffPaymentService.buildOnCuffRef = jasmine.createSpy('OnCuffPaymentService.buildOnCuffRef').andReturn(buildOnCuffRefReturn);
    });

    describe('Given a controller execution context\n', function() {
        beforeEach(inject(function($controller, $rootScope, $q) {
            scope = $rootScope.$new();

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

        describe('and a valid newVal different to the oldVal \n When duedateWatcherCallback is called\n Then', function() {

            beforeEach(function() {
                var oldVal = new Date();
                var newVal = oldVal;

                PaymentOnCuffCtrl.duedateWatcherCallback(newVal, oldVal);
            });

            it('should call PaymentOnCuffCtrl.buildInstallments', function() {
                expect(OnCuffPaymentService.buildInstallments).not.toHaveBeenCalledWith(scope.onCuff);
            });
        });

        describe('and a valid newVal equal to the oldVal \n When duedateWatcherCallback is called\n Then', function() {

            beforeEach(function() {
                var oldVal = new Date();
                var newVal = oldVal;

                PaymentOnCuffCtrl.duedateWatcherCallback(newVal, oldVal);
            });

            it('shouldn\'t call PaymentOnCuffCtrl.buildInstallments', function() {
                expect(OnCuffPaymentService.buildInstallments).not.toHaveBeenCalled();
            });

            it('should left onCuff.installments untouched', function() {
                expect(scope.onCuff.installments).toEqual(buildOnCuffRefReturn.installments);
            });
        });

        describe('and a invalid newVal \n When duedateWatcherCallback is called\n Then', function() {

            beforeEach(function() {
                var oldVal = new Date();
                var newVal = 'abc';

                PaymentOnCuffCtrl.duedateWatcherCallback(newVal, oldVal);
            });

            it('shouldn\'t call PaymentOnCuffCtrl.buildInstallments', function() {
                expect(OnCuffPaymentService.buildInstallments).not.toHaveBeenCalled();
            });

            it('should left onCuff.installments untouched', function() {
                expect(scope.onCuff.installments).toEqual(buildOnCuffRefReturn.installments);
            });
        });
    });
});
