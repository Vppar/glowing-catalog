'use strict';

describe('Service: Coupon', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.coupon');
    });
    
    // instantiate service
    var VoucherService = undefined;

    beforeEach(inject(function(_VoucherService_) {
    	VoucherService = _VoucherService_;
    }));
});