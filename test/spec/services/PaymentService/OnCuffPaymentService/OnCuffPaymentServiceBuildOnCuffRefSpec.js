'use strict';

describe('Service: OnCuffPaymentServiceBuildOnCuffRefSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var Misplacedservice = null;

    var fakeNow = null;
    var monthTime = null;

    // Stub dependencies
    beforeEach(function() {
        EntityService = {};
        PaymentService = {};
        Misplacedservice = {};

        // 03/01/2014 - 00:00:00 UTC+3
        fakeNow = 1393642800000;
        monthTime = 2678400000;

        spyOn(Date.prototype, 'setHours');
        spyOn(Date.prototype, 'setMinutes');
        spyOn(Date.prototype, 'setSeconds');
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.filter.sum');
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

    // Given
    describe('Given a valid remainingAmount \n and a existing entityUUID\n', function() {
        var remainingAmount = null;
        var entityUUID = null;
        var onCuffRef = null;
        var buildInstallmentsReturn = null;
        var paymentServiceListReturn = null;

        beforeEach(function() {
            remainingAmount = 347.28;
            entityUUID = 2;
            buildInstallmentsReturn = [];
            paymentServiceListReturn = [];

            OnCuffPaymentService.buildInstallments =
                    jasmine.createSpy('OnCuffPaymentService.buildInstallments').andReturn(buildInstallmentsReturn);

            EntityService.read = jasmine.createSpy('EntityService.read');

        });

        describe('and no onCuff payment previously inserted \n When buildOnCuffRef is called\n Then', function() {

            beforeEach(function() {
                PaymentService.list = jasmine.createSpy('PaymentService.list').andCallFake(function(name) {
                    if (name === 'onCuff') {
                        return [];
                    }
                });
                onCuffRef = OnCuffPaymentService.buildOnCuffRef(remainingAmount, entityUUID);
            });

            it('should search for the informed entity', function() {
                expect(EntityService.read).toHaveBeenCalledWith(entityUUID);
            });

            it('should try to recover pre-existing onCuff payments', function() {
                expect(PaymentService.list).toHaveBeenCalledWith('onCuff');
            });

            it('should build onCuff installments', function() {
                expect(OnCuffPaymentService.buildInstallments).toHaveBeenCalledWith(1, fakeNow, remainingAmount);
            });

            it('should return an onCuff object', function() {
                expect(onCuffRef.numberOfInstallments).toBe(1);

                // duedate ajustment
                expect(onCuffRef.dueDate.getTime()).toBe(fakeNow);
                expect(Date.prototype.setHours).toHaveBeenCalledWith(0);
                expect(Date.prototype.setMinutes).toHaveBeenCalledWith(0);
                expect(Date.prototype.setSeconds).toHaveBeenCalledWith(0);

                expect(onCuffRef.amount).toBe(remainingAmount);
                expect(onCuffRef.installments).toEqual([]);
            });
        });

        describe('and no onCuff payment previously inserted \n When buildOnCuffRef is called\n Then', function() {

            beforeEach(function() {
                paymentServiceListReturn = [
                    {
                        dueDate : new Date(fakeNow),
                        amount : 150
                    }, {
                        dueDate : new Date(fakeNow + monthTime),
                        amount : 150
                    }
                ];
                PaymentService.list = jasmine.createSpy('PaymentService.list').andCallFake(function(name) {
                    if (name === 'onCuff') {
                        return paymentServiceListReturn;
                    }
                });
                onCuffRef = OnCuffPaymentService.buildOnCuffRef(remainingAmount, entityUUID);
            });

            it('should search for the informed entity', function() {
                expect(EntityService.read).toHaveBeenCalledWith(entityUUID);
            });

            it('should try to recover pre-existing onCuff payments', function() {
                expect(PaymentService.list).toHaveBeenCalledWith('onCuff');
            });

            it('shouldn\'t build onCuff installments', function() {
                expect(OnCuffPaymentService.buildInstallments).not.toHaveBeenCalled();
            });

            it('should return an onCuff object', function() {
                expect(onCuffRef.numberOfInstallments).toBe(2);

                // duedate ajustment
                expect(onCuffRef.dueDate.getTime()).toBe(fakeNow);
                expect(onCuffRef.amount).toBe(300);
                expect(onCuffRef.installments).toEqual(paymentServiceListReturn);
            });
        });
    });

});
