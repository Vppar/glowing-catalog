'use strict';

describe('Service: OnCuffPaymentServiceRecalcInstallmentsSpec\n', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;
    var Misplacedservice = null;

    var index = null;
    var onCuff = null;
    var expectedInstallments = null;
    var returnedInstallments = null;

    // Stub dependencies
    beforeEach(function() {
        EntityService = {};
        PaymentService = {};
        Misplacedservice = {};
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

    describe('Given an installment index \n and an onCuffRef object \n When', function() {

        beforeEach(function() {
            returnedInstallments = [
                {
                    stub : 'i\'m a stub'
                }
            ];
            Misplacedservice.recalc = jasmine.createSpy('Misplacedservice.recalc').andReturn(returnedInstallments);
            index = 1;
            onCuff = {
                amount : 1,
                installments : []
            };
        });

        describe('recalcInstallments is called \n Then', function() {

            beforeEach(function() {
                expectedInstallments = OnCuffPaymentService.recalcInstallments(index, onCuff);
            });

            it('should call Misplacedservice.calc', function() {
                expect(Misplacedservice.recalc).toHaveBeenCalledWith(onCuff.amount, index, onCuff.installments, 'amount');
            });
            it('should return installments from Misplacedservice.calc', function() {
                expect(expectedInstallments).toEqual(returnedInstallments);
            });
        });

    });
});
