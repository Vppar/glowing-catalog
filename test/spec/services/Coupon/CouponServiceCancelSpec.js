'use strict';

describe(
		'Service: Coupon',
		function() {

			var voucherStub = {};

			// load the service's module
			beforeEach(function() {
				module('tnt.catalog.service.coupon');
				module('tnt.catalog.voucher.entity');
			});

			// instantiate service
			var VoucherKeeper = undefined;
			var CouponService = undefined;

			// inject the dependencies
			beforeEach(inject(function(_VoucherKeeper_, _CouponService_) {
				VoucherKeeper = _VoucherService_;
				CouponService = _CouponService_;
			}));

			beforeEach(function() {
				voucherStub.cancel = jasmine.createSpy('VoucherKeeper.cancel');

			});

			it('should cancel the coupon with the passed id', function() {

				CouponService.cancel(id);
				expect(VoucherKeeper.cancel).toHaveBeenCalled();
				expect(function(){voucherStub.cancel(1,"coupon");}).not.toThrow();

			});

			it('should not cancel a voucher with same id and with other than the correct type',
					function() {

						CouponService.cancel(id);
						expect(VoucherKeeper.cancel).toHaveBeenCalled();
						expect(function(){voucherStub.cancel(1,"coupon");}).toThrow();

					});
		});