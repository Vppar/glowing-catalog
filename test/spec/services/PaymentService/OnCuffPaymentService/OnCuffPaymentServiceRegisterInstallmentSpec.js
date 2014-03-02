'use strict';

describe('Service: OnCuffPaymentServiceRegisterInstallmentSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var Misplacedservice = null;
    var OnCuffPayment = null;
    var fakeNow = null;
    var monthTime = null;

    // Stub dependencies
    beforeEach(function() {
        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;
        monthTime = 2592000;

        EntityService = {};
        PaymentService = {};
        Misplacedservice = {};
        PaymentService.clear = jasmine.createSpy('PaymentService.clear');
        PaymentService.add = jasmine.createSpy('PaymentService.add');
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.entity');
        module('tnt.catalog.payment.oncuff.service');

        // Mock OnCuffPaymentService dependencies
        module(function($provide) {
            $provide.value('EntityService', EntityService);
            $provide.value('PaymentService', PaymentService);
            $provide.value('Misplacedservice', Misplacedservice);
        });
    });

    // instantiate service
    beforeEach(inject(function(_OnCuffPaymentService_, _OnCuffPayment_) {
        OnCuffPaymentService = _OnCuffPaymentService_;
        OnCuffPayment = _OnCuffPayment_;
    }));

    // Given
    describe('Given a list of valid onCuff installments\n When', function() {

        var installment1 = null;
        var installment2 = null;

        var onCuffPayment1 = null;
        var onCuffPayment2 = null;

        beforeEach(function() {
            installment1 = {
                amount : 100,
                dueDate : new Date(fakeNow)
            };
            installment2 = {
                amount : 101,
                dueDate : new Date(fakeNow + monthTime)
            };

            onCuffPayment1 = new OnCuffPayment(installment1.amount, installment1.dueDate);
            onCuffPayment2 = new OnCuffPayment(installment2.amount, installment2.dueDate);
        });

        // When
        describe('OnCuffPaymentService.registerInstallments is called\n Then', function() {

            beforeEach(function() {
                OnCuffPaymentService.registerInstallments([
                    installment1, installment2
                ]);
            });

            // Then
            it('should clear previous entries in PaymentService', function() {
                expect(PaymentService.clear).toHaveBeenCalledWith('onCuff');
            });
            // Then
            it('should add new entries in PaymentService', function() {
                expect(PaymentService.add.calls[0].args[0]).toEqual(onCuffPayment1);
                expect(PaymentService.add.calls[1].args[0]).toEqual(onCuffPayment2);
            });
        });
    });

    // Given
    describe('Given an empty list of onCuff installments\n When', function() {

        // When
        describe('OnCuffPaymentService.registerInstallments is called\n Then', function() {

            beforeEach(function() {
                OnCuffPaymentService.registerInstallments([]);
            });

            // Then
            it('should clear previous entries in PaymentService', function() {
                expect(PaymentService.clear).toHaveBeenCalledWith('onCuff');
            });
            // Then
            it('shouldn\'t add new entries in PaymentService', function() {
                expect(PaymentService.add).not.toHaveBeenCalled();
            });
        });
    });

    // Given
    describe('Given a list of onCuff installments \n and it has an installment with invalid amount\n When', function() {

        var installment1 = null;
        var installment2 = null;
        var installment3 = null;

        var onCuffPayment1 = null;

        beforeEach(function() {
            installment1 = {
                amount : 100,
                dueDate : new Date(fakeNow)
            };
            installment2 = {
                amount : 0,
                dueDate : new Date(fakeNow + monthTime)
            };
            installment3 = {
                amount : -101,
                dueDate : new Date(fakeNow + 2 * monthTime)
            };

            onCuffPayment1 = new OnCuffPayment(installment1.amount, installment1.dueDate);
        });

        // When
        describe('OnCuffPaymentService.registerInstallments is called\n Then', function() {

            beforeEach(function() {
                OnCuffPaymentService.registerInstallments([
                    installment1, installment2, installment3
                ]);
            });

            // Then
            it('should clear previous entries in PaymentService', function() {
                expect(PaymentService.clear).toHaveBeenCalledWith('onCuff');
            });
            // Then
            it('should add new entries in PaymentService', function() {
                expect(PaymentService.add.calls.length).toBe(1);
                expect(PaymentService.add.calls[0].args[0]).toEqual(onCuffPayment1);
            });
        });
    });

});
