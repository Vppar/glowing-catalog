'use strict';

describe('Controller: PaymentOnCuffCtrlConfirmSpec\n', function() {

    var DialogService = null;
    var OrderService = null;
    var OnCuffPaymentService = null;

    var scope = null;
    var fakeNow = null;

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
        buildOnCuffRefReturn = {
            numberOfInstallments : 1,
            duedate : new Date(),
            amount : 1
        };

        OnCuffPaymentService = {};
        OnCuffPaymentService.buildOnCuffRef = jasmine.createSpy('OnCuffPaymentService.buildOnCuffRef').andReturn(buildOnCuffRefReturn);
        OnCuffPaymentService.registerInstallments = jasmine.createSpy('OnCuffPaymentService.registerInstallments');
    });

    describe('Given a controller execution context\n', function() {
        beforeEach(inject(function($controller, $rootScope, $q) {
            scope = $rootScope.$new();

            // inherited from PaymentCtrl
            scope.total = {};
            scope.total.change = -1;
            scope.selectPaymentMethod = jasmine.createSpy('scope.selectPaymentMethod');

            $controller('PaymentOnCuffCtrl', {
                $scope : scope,
                DialogService : DialogService,
                OrderService : OrderService,
                OnCuffPaymentService : OnCuffPaymentService
            });

        }));

        describe('and a valid newVal different to the oldVal \n When duedateWatcherCallback is called\n Then', function() {

            beforeEach(function() {
                scope.confirmOnCuffPayment();
            });

            it('should call OnCuffPaymentService.buildInstallments', function() {
                expect(OnCuffPaymentService.registerInstallments).toHaveBeenCalledWith(buildOnCuffRefReturn.installments);
            });

            it('should update onCuff.installments', function() {
                expect(scope.selectPaymentMethod).toHaveBeenCalledWith('none');
            });
        });
    });
});
