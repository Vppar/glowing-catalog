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
    
	it('should create a valid full coupom', function() {
    	expect(true).toBe(false);
    });
    
    it('should not create a coupom with negative value', function() {
    	expect(true).toBe(false);
    });
    
    it('should not create a coupom with other type', function() {
    	expect(true).toBe(false);
    });
    
    it('should create a coupom without a remark', function() {
    	expect(true).toBe(false);
    });
    
    it('should create a coupom without a document', function() {
    	expect(true).toBe(false);
    });
    
    it('should not create a coupom without entity', function() {
    	expect(true).toBe(false);
    });
    
    
});