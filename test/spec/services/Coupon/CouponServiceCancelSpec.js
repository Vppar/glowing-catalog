'use strict';

describe(
		'Service: Coupon',
		function() {

			var voucherStub = {};

			// load the service's module
			beforeEach(function() {
				module('tnt.catalog.service.coupon');
			});

			// define the mocks
			beforeEach(function() {
				voucherStub.cancel = jasmine.createSpy('VoucherKeeper.cancel');
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

			it('should cancel the coupon with the passed id', function() {

				CouponService.cancel(1);
				expect(voucherStub.cancel).toHaveBeenCallWith(1, "coupon");
				expect(function() {
					voucherStub.cancel(1, "coupon");
				}).not.toThrow();

			});

			it(
					'should not cancel a voucher with same id and with other than the correct type',
					function() {

						CouponService.cancel(1);
						expect(voucherStub.cancel).toHaveBeenCalled();
						expect(voucherStub.cancel).toThrow();

					});
		});