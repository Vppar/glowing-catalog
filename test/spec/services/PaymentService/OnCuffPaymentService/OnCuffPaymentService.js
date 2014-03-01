'use strict';

describe('Service: Oncuffpaymentservice', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var Oncuffpaymentservice;
    beforeEach(inject(function(_Oncuffpaymentservice_) {
        Oncuffpaymentservice = _Oncuffpaymentservice_;
    }));

    it('should do something', function() {
        expect(!!Oncuffpaymentservice).toBe(true);
    });

});
