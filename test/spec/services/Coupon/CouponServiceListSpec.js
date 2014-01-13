'use strict';

xdescribe('Service: Coupon', function() {

	var voucherStub = {};
	
	var coupon1 = { id: 1, 
		entity: 123, 
		amount: 123.45, 
		type: "coupon", 
		redeemed: false, 
		remarks: "lalala", 
		document: { type: "pedido", id: 123 }
	};
	
	var coupon2 = { id: 2, 
			entity: 123, 
			amount: 10.45, 
			type: "coupon", 
			redeemed: false, 
			remarks: "coupon2", 
			document: { type: "pedido", id: 123 }
	};
	
	var voucher1 = { id: 3, 
			entity: 12, 
			amount: 11.45, 
			type: "voucher", 
			redeemed: false
	};
	
	
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
    	
	    voucherStub.list = jasmine.createSpy('VoucherKeeper.list').andCallFake(function() {
	    });
	    
    });
    
    it('should list all the coupon', function() {
    	
    	
    	
    	var list = CouponService.list();
    	
    	expect(true).toBe(false);
    });
    
    it('should not list the the different types', function() {
    	expect(true).toBe(false);
    });
    
});
