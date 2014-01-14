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
	
	var couponWithoutId = {
			entity: 123,
			amount: 123.45,
			type: "coupon",
			redeemed: false,
			remarks: "lalala",
			document:{ type: "pedido", id: 123 }
			};
	
	var voucher = {
			id: 1234,
			entity: 123,
			amount: 123.45,
			type: "voucher",
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
		voucherStub.add = jasmine.createSpy('VoucherKeeper.add');
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

	it('should add a valid coupon to the keeper', function() {
		CouponService.add(coupon, "coupon");
		expect(CouponService.isValid).toHaveBeenCallWith(coupon);
		expect(voucherStub.create).toHaveBeenCallWith(coupon);
	});

	it('should not add to the keeper an voucher that is not a coupon',
			function() {
				CouponService.add(voucher, "voucher");
				expect(CouponService.isValid).toHaveBeenCallWith(voucher);
				expect(voucherStub.create).not.toHaveBeenCalled();
			});

	it('should not add to the keeper a coupon without an id', function() {
		CouponService.add(couponWithoutId, "coupon");
		expect(CouponService.isValid).toHaveBeenCallWith(couponWithoutId);
		expect(voucherStub.create).not.toHaveBeenCallWith(couponWithoutId);
	});

});