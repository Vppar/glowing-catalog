'use strict';

ddescribe('Service: OnCuffPaymentServiceRegisterInstallmentSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var OnCuffPayment = null;
    var fakeNow = null;
    var monthTime = null;

    // Stub dependencies
    beforeEach(function() {
        // 03/01/2014 - 00:00:00
        fakeNow = 1393632000000;
        monthTime = 2592000;

        EntityService = {};
        PaymentService = {};
        PaymentService.clear = jasmine.createSpy('PaymentService.clear');
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.oncuff.service');

        // Mock OnCuffPaymentService dependencies
        module(function($provide) {
            $provide.value('EntityService', EntityService);
            $provide.value('PaymentService', PaymentService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_OnCuffPaymentService_, _OnCuffPayment_) {
        OnCuffPaymentService = _OnCuffPaymentService_;
        OnCuffPayment = _OnCuffPayment_;
    }));

    describe('when registerInstallments is called\n', function() {
        // given
        var installment1 = {
            amount : 100,
            dueDate : new Date(fakeNow)
        };
        var installment2 = {
            amount : 100,
            dueDate : new Date(fakeNow + monthTime)
        };
        var installment3 = {
            amount : 100,
            dueDate : new Date(fakeNow + 2 * monthTime)
        };
        
        var onCuffPayment1 = new OnCuffPayment(installment1);
        var onCuffPayment2 = new OnCuffPayment(installment2);
        var onCuffPayment3 = new OnCuffPayment(installment3);

        // when
        OnCuffPaymentService.registerInstallments([
            installment1, installment2, installment3
        ]);

        // then
        it('should clear previous entries in PaymentService', function() {
            expect(PaymentService.clear).toHaveBeenCalledWith('onCuff');
        });
        it('should add new entries in PaymentService', function() {
            expect(PaymentService.add.calls[0]).toHaveBeenCalledWith(onCuffPayment1);
            expect(PaymentService.add.calls[1]).toHaveBeenCalledWith(onCuffPayment2);
            expect(PaymentService.add.calls[2]).toHaveBeenCalledWith(onCuffPayment3);
        });
    });

});
