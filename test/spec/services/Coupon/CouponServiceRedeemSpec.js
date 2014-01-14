'use strict';

xdescribe('Service: Coupon', function() {

	var voucherStub = {};

	// load the service's module
	beforeEach(function() {
		module('tnt.catalog.service.coupon');
	});

	// define the mocks
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

	it('should redeem the coupon with the passed id', function() {
		var id = 1;
		CouponService.redeem(id);
		expect(voucherStub.redeem).toHaveBeenCalled(id,'coupon');
	});
	
	it('should not redeem any coupon with a negative id', function() {
		var id = -1;
		CouponService.redeem(id);
		expect(voucherStub.redeem).not.toHaveBeenCalled();
	});
	
	it('should not redeem any coupon with an id equals zero', function() {
		var id = 0;
		CouponService.redeem(id);
		expect(voucherStub.redeem).not.toHaveBeenCalled();
	});
	
	it('should not redeem any coupon with a undefined id', function() {
		var id = undefined;
		CouponService.redeem(id);
		expect(voucherStub.redeem).not.toHaveBeenCalled();
	});

	it('should not redeem a voucher with other than the correct type',
			function() {
				CouponService.redeem(id);
				expect(voucherStub.redeem).toHaveBeenCalled(id,'coupon');
			});

});