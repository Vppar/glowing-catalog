'use strict';

describe('Controller: PaymentOnCuffCtrlBuildInstallmentsSpec\n', function() {

    var DialogService = null;
    var OrderService = null;
    var OnCuffPaymentService = null;
    var PaymentOnCuffCtrl = null;

    var scope = null;
    var fakeNow = null;

    var buildInstallmentsReturn = null;

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
            stub : 'i\'m a stub'
        };

        OnCuffPaymentService = {};
        OnCuffPaymentService.buildInstallments =
                jasmine.createSpy('OnCuffPaymentService.buildInstallments').andReturn(buildInstallmentsReturn);
        OnCuffPaymentService.buildOnCuffRef = jasmine.createSpy('OnCuffPaymentService.buildOnCuffRef');
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

        describe('and a valid onCuffRef object \n When buildInstallments is called\n Then', function() {

            var onCuff = {};
            var result = null;

            beforeEach(function() {
                onCuff.numberOfInstallments = 1;
                onCuff.duedate = new Date();
                onCuff.amount = 1;

                result = PaymentOnCuffCtrl.buildInstallments(onCuff);
            });

            it('should call OnCuffPaymentService.buildInstallments', function() {
                expect(OnCuffPaymentService.buildInstallments).toHaveBeenCalledWith(
                        onCuff.numberOfInstallments, onCuff.duedate.getTime(), onCuff.amount);
                expect(result).toEqual(buildInstallmentsReturn);
            });
        });
    });
});
