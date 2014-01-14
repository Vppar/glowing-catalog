'use strict';

describe('Service: Coupon', function() {

	var voucherStub = {};

	var coupon = {
			id: 1234,
			entity: 123,
			amount: 123.45,
			type: "coupon",
			redeemed: false,
			remarks: "lalala",
			document:{ type: "pedido", id: 123 }
			};
	
	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.service.coupon');
	});
	
	// define the mocks
	beforeEach(function() {
		
		voucherStub.create = jasmine.createSpy('VoucherKeeper.create');
		
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

	it('should create a coupom', function() {
		var id = 1234;
		var entity = 123;
		var amount = 123.45;
		var type = "coupon";
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		var c = CouponService.create(id,entity,amount,type,remarks,document);
		expect(voucherStub.create).toHaveBeenCalled();
		expect(c).toBeEqual(coupon);
		
	});
	
	it('should not create a coupom with negative value', function() {
		var id = 1234;
		var entity = 123;
		var amount = -123.45;
		var type = "coupon";
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		var c = CouponService.create(id,entity,amount,type,remarks,document);
		expect(voucherStub.create).toHaveBeenCalled();
		expect(c).toBeEqual(null);
	});

	it('should not create a coupom with other type', function() {
		var id = 1234;
		var entity = 123;
		var amount = 123.45;
		var type = "type";
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		var c = CouponService.create(id,entity,amount,type,remarks,document);
		expect(voucherStub.create).not.toHaveBeenCalled();
		expect(c).toBeEqual(null);
	});

	it('should create a coupom without a remark', function() {
		var id = 1234;
		var entity = 123;
		var amount = 123.45;
		var type = "coupon";
		var document = { type: "pedido", id: 123 };
		
		var c = CouponService.create(id,entity,amount,type,undefined,document);
		expect(voucherStub.create).toHaveBeenCalled();
		expect(c).toBeEqual(coupon);
	});

	it('should create a coupom without a document', function() {
		var id = 1234;
		var entity = 123;
		var amount = 123.45;
		var type = "coupon";
		var remarks = "lalala";
		
		var c = CouponService.create(id,entity,amount,type,remarks);
		expect(voucherStub.create).toHaveBeenCalled();
		expect(c).toBeEqual(coupon);
	});

	it('should not create a coupom without entity', function() {
		var id = 1234;
		var amount = 123.45;
		var type = "type";
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		var c = CouponService.create(id,undefined,amount,type,remarks,document);
		expect(voucherStub.create).not.toHaveBeenCalled();
		expect(c).toEqual(null);
	});
	
	

});