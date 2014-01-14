'use strict';

describe('Service: Coupon', function() {

	var voucherStub = {};
	
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
		var entity = 123;
		var amount = 123.45;

		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		CouponService.create(entity,amount,remarks,document);
		expect(voucherStub.create).toHaveBeenCalled();		
	});
	
	it('should not create a coupom with negative value', function() {
		var entity = 123;
		var amount = -123.45;
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		CouponService.create(entity,amount,remarks,document);
		expect(voucherStub.create).not.toHaveBeenCalled();
	});
	
	it('should create a coupom without a remark', function() {
		var entity = 123;
		var amount = 123.45;
		var document = { type: "pedido", id: 123 };
		
		CouponService.create(entity,amount,undefined,document);
		expect(voucherStub.create).toHaveBeenCalled();
	});

	it('should create a coupom without a document', function() {
		var entity = 123;
		var amount = 123.45;
		var remarks = "lalala";
		
		CouponService.create(entity,amount,remarks);
		expect(voucherStub.create).toHaveBeenCalled();
	});

	it('should not create a coupom without entity', function() {

		var amount = 123.45;
		var remarks = "lalala";
		var document = { type: "pedido", id: 123 };
		
		CouponService.create(undefined,amount,remarks,document);
		expect(voucherStub.create).not.toHaveBeenCalled();
	});
	
	

});