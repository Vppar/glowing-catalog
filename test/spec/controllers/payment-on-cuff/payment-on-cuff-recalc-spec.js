'use strict';

describe('Controller: PaymentOnCuffCtrlRecalcSpec\n', function() {

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
        OnCuffPaymentService.recalcInstallments = jasmine.createSpy('OnCuffPaymentService.recalcInstallments');
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
            var index = 1;

            beforeEach(function() {
                scope.recalcInstallments(index);
            });

            it('should call OnCuffPaymentService.buildInstallments', function() {
                expect(OnCuffPaymentService.recalcInstallments).toHaveBeenCalledWith(index, buildOnCuffRefReturn);
            });
        });
    });
});
