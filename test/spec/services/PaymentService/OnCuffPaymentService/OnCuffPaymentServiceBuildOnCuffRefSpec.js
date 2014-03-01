'use strict';

ddescribe('Service: OnCuffPaymentServiceBuildOnCuffRefSpec', function() {

    var OnCuffPaymentService = null;
    var EntityService = null;
    var PaymentService = null;

    // Stub dependencies
    beforeEach(function() {
        EntityService = {};
        PaymentService = {};
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.payment.oncuff.service');

        // Mock OnCuffPaymentService dependencies
        module(function($provide) {
            $provide.value('EntityService', EntityService);
            $provide.value('PaymentService', PaymentService);
        });
    });

    // instantiate service
    beforeEach(inject(function(_OnCuffPaymentService_) {
        OnCuffPaymentService = _OnCuffPaymentService_;
    }));

    describe('when buildOnCuffRef is called', function() {

    });

});
