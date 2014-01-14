'use strict';

xdescribe('Service: Coupon', function() {

	var voucherStub = {};
	
	var c1 = {
			id: 1,
			entity: 1,
			amount: 1.23,
			type: "coupon",
			redeemed: false,
			remarks: "lalala",
			document:{ type: "pedido", id: 123 }
			};
	
	var c2 = {
			id: 2,
			entity: 2,
			amount: 2.34,
			type: "coupon",
			redeemed: false,
			remarks: "lalala",
			document:{ type: "pedido", id: 123 }
			};
	
	var c3 = {
			id: 1,
			entity: 2,
			amount: 2.34,
			type: "voucher",
			redeemed: false,
			remarks: "lalala",
			document:{ type: "pedido", id: 123 }
			};
	

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.service.coupon');
	});

	//define the mocks
	beforeEach(function() {
		voucherStub.list = jasmine.createSpy('VoucherKeeper.list');
		module(function($provide) {
			$provide.value('VoucherKeeper', voucherStub);
		});
	});

	// instantiate service
	var CouponService = undefined;
	
	// inject the dependencies
	beforeEach(inject(function(_CouponService_) {
		CouponService = _CouponService_;
	}));

	it('should list all the coupon', function() {

		var list = CouponService.list();
		expect(voucherStub.list).toHaveBeenCallWith('coupon');
		
	});

	it('should not list the the different types', function() {

		var list = CouponService.list();
		expect(voucherStub.list).not.toHaveBeenCall('voucher');		
	});

});
