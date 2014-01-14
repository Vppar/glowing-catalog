'use strict';

describe('Service: Coupon', function() {

	var coupon = {
		id : 1,
		entity : 123,
		amount : 123.45,
		type : "coupon",
		redeemed : false,
		remarks : "lalala",
		document : {
			type : "pedido",
			id : 123
		}
	};

	var couponNegativeAmount = {
		id : 1,
		entity : 123,
		amount : -123.45,
		type : "coupon",
		redeemed : false,
		remarks : "lalala",
		document : {
			type : "pedido",
			id : 123
		}
	};
	
	var couponWithoutEntity = {
			id : 1,
			amount : -123.45,
			type : "coupon",
			redeemed : false,
			remarks : "lalala",
			document : {
				type : "pedido",
				id : 123
			}
		};
	
	var couponWithoutRemarks = {
			id : 1,
			entity : 123,
			amount : -123.45,
			type : "coupon",
			redeemed : false,
			document : {
				type : "pedido",
				id : 123
			}
		};
	
	var couponWithoutDocument = {
			id : 1,
			amount : -123.45,
			type : "coupon",
			redeemed : false,
			remarks : "lalala"
		};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.service.coupon');
	});

	// instantiate service
	var CouponService = undefined;

	// inject the dependencies
	beforeEach(inject(function(_CouponService_) {
		CouponService = _CouponService_;
	}));

	it('should validate a correct coupom', function() {
		var result = CouponService.isValid(coupon);
		expect(result).toBe(true);
	});

	it('should not validate a coupom with a negative amount', function() {
		var result = CouponService.isValid(couponNegativeAmount);
		expect(result).toBe(false);
	});

	it('should not validate a coupom without an entity', function() {
		var result = CouponService.isValid(couponWithoutEntity);
		expect(result).toBe(false);
	});

	it('should validate a coupom without a remark', function() {
		var result = CouponService.isValid(couponWithoutRemarks);
		expect(result).toBe(true);
	});

	it('should validate a coupom without a document', function() {
		var result = CouponService.isValid(couponWithoutDocument);
		expect(result).toBe(true);
	});
});