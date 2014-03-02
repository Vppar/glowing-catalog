'use strict';

describe('Service: OnCuffPaymentServiceBuildInstallmentsSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var Misplacedservice = null;

    var fakeNow = null;
    var numberOfInstallments = null;
    var firstDueDateTime = null;
    var amount = null;

    // Stub dependencies
    beforeEach(function() {
        EntityService = {};
        PaymentService = {};
        Misplacedservice = {};

        Misplacedservice.recalc = jasmine.createSpy('Misplacedservice.recalc');

        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.service');

        // Mock OnCuffPaymentService dependencies
        module(function($provide) {
            $provide.value('EntityService', EntityService);
            $provide.value('PaymentService', PaymentService);
            $provide.value('Misplacedservice', Misplacedservice);
        });
    });

    // instantiate service
    beforeEach(inject(function(_OnCuffPaymentService_) {
        OnCuffPaymentService = _OnCuffPaymentService_;
    }));

    describe('Given a valid firstDueDateTime \n and positive amount \n When', function() {

        describe('and a numberOfInstallments equal to zero\n When', function() {
            var installments = null;
            var result = null;

            beforeEach(function() {
                numberOfInstallments = 0;
                firstDueDateTime = fakeNow;
                amount = 347.25;
                installments = [];

                OnCuffPaymentService.buildDueDate = jasmine.createSpy('OnCuffPaymentService.buildDueDate');
            });

            describe('buildInstallments is called \n Then', function() {

                beforeEach(function() {
                    result = OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
                });

                it('should call buildDueDate', function() {
                    expect(OnCuffPaymentService.buildDueDate).not.toHaveBeenCalled();
                });

                it('should call Misplacedservice.recalc', function() {
                    expect(Misplacedservice.recalc).toHaveBeenCalledWith(amount, -1, installments, 'amount');
                });

                it('should return installments', function() {
                    expect(result).toEqual(installments);
                });
            });
        });

        describe('and a numberOfInstallments equal to one\n When', function() {
            var installments = null;
            var result = null;

            beforeEach(function() {
                numberOfInstallments = 1;
                firstDueDateTime = fakeNow;
                amount = 347.25;
                installments = [
                    {
                        number : 1,
                        dueDate : new Date(fakeNow),
                        amount : 0
                    }
                ];

                OnCuffPaymentService.buildDueDate = jasmine.createSpy('OnCuffPaymentService.buildDueDate').andReturn(new Date(fakeNow));
            });

            describe('buildInstallments is called \n Then', function() {

                beforeEach(function() {
                    result = OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
                });

                it('should call buildDueDate', function() {
                    expect(OnCuffPaymentService.buildDueDate.calls.length).toBe(numberOfInstallments);

                    expect(OnCuffPaymentService.buildDueDate.calls[0].args[0]).toBe(firstDueDateTime);
                    expect(OnCuffPaymentService.buildDueDate.calls[0].args[1]).toBe(0);
                });

                it('should call Misplacedservice.recalc', function() {
                    expect(Misplacedservice.recalc).toHaveBeenCalledWith(amount, -1, installments, 'amount');
                });

                it('should return installments', function() {
                    expect(result).toEqual(installments);
                });
            });
        });

        describe('and a numberOfInstallments greater than one\n When', function() {
            var installments = null;
            var result = null;

            beforeEach(function() {
                numberOfInstallments = 3;
                firstDueDateTime = fakeNow;
                amount = 347.25;
                installments = [
                    {
                        number : 1,
                        dueDate : new Date(fakeNow),
                        amount : 0
                    }, {
                        number : 2,
                        dueDate : new Date(fakeNow),
                        amount : 0
                    }, {
                        number : 3,
                        dueDate : new Date(fakeNow),
                        amount : 0
                    }
                ];

                OnCuffPaymentService.buildDueDate = jasmine.createSpy('OnCuffPaymentService.buildDueDate').andReturn(new Date(fakeNow));
            });

            describe('buildInstallments is called \n Then', function() {

                beforeEach(function() {
                    result = OnCuffPaymentService.buildInstallments(numberOfInstallments, firstDueDateTime, amount);
                });

                it('should call buildDueDate', function() {
                    expect(OnCuffPaymentService.buildDueDate.calls.length).toBe(numberOfInstallments);

                    expect(OnCuffPaymentService.buildDueDate.calls[0].args[0]).toBe(firstDueDateTime);
                    expect(OnCuffPaymentService.buildDueDate.calls[0].args[1]).toBe(0);

                    expect(OnCuffPaymentService.buildDueDate.calls[1].args[0]).toBe(firstDueDateTime);
                    expect(OnCuffPaymentService.buildDueDate.calls[1].args[1]).toBe(1);

                    expect(OnCuffPaymentService.buildDueDate.calls[2].args[0]).toBe(firstDueDateTime);
                    expect(OnCuffPaymentService.buildDueDate.calls[2].args[1]).toBe(2);
                });

                it('should call Misplacedservice.recalc', function() {
                    expect(Misplacedservice.recalc).toHaveBeenCalledWith(amount, -1, installments, 'amount');
                });

                it('should return installments', function() {
                    expect(result).toEqual(installments);
                });
            });
        });
    });

});
