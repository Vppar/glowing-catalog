'use strict';

xdescribe('Service: Coupon', function() {

	// load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.coupon');
        module('tnt.catalog.voucher.entity');
    });
    
    // instantiate service
    var VoucherService = undefined;
    var CouponService = undefined;

    
    //inject the dependencies
    beforeEach(inject(function(_VoucherService_,_CouponService_) {
    	VoucherService = _VoucherService_;
    	CouponService = _CouponService_;
    }));
    
    beforeEach(function() {
    	
        voucherStub.create = jasmine.createSpy('VoucherKeeper.create').andCallFake(function() {
        });
	    
    });
    
    it('should add a valid coupon to the keeper', function() {
    
    	
    	
    	expect(true).toBe(false);
    });
    
    it('should not add to the keeper an voucher that is not a coupon', function() {
    	expect(true).toBe(false);
    });
    
    it('should not add to the keeper a coupon without an id', function() {
    	expect(true).toBe(false);
    });
    
});