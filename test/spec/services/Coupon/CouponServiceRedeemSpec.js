'use strict';

xdescribe('Service: Coupon', function() {

	var voucherStub = {};

	var coupon = {
		id : 1,
		entity : 123,
		amount : 123.45,
		type : "coupon",
		redeemed : true,
		remarks : "lalala",
		document : {
			type : "pedido",
			id : 123
		}
	};

	var voucher = {
		id : 2,
		entity : 4,
		amount : 10.45,
		type : "voucher",
		redeemed : true,
	};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.service.coupon');
		module('tnt.catalog.voucher.entity');
	});

	// instantiate service
	var VoucherService = undefined;
	var CouponService = undefined;

	// inject the dependencies
	beforeEach(inject(function(_VoucherService_, _CouponService_) {
		VoucherService = _VoucherService_;
		CouponService = _CouponService_;
	}));

	beforeEach(function() {

		voucherStub.redeem = jasmine.createSpy('VoucherKeeper.redeem')
				.andCallFake(function(id) {
				});

	});

	it('should redeem the coupon with the passed id', function() {
		expect(true).toBe(false);
	});

	it('should not redeem a voucher with other than the correct type',
			function() {
				expect(true).toBe(false);
			});

	/*
	 * { id: 1234(auto), entity: 123, amount: 123.45, type: "voucher", redeemed:
	 * false, remarks: "lalala"(optional), document: { type: "pedido", id: 123 }
	 * (optional) }
	 */

});