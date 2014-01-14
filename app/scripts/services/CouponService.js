(function(angular) {
	'use strict';

	angular.module('tnt.catalog.service.coupon',
			[ 'tnt.utils.array', 'tnt.catalog.inventory.entity' ])
			.service(
					'CouponService',
					function CouponService(ArrayUtils, VoucherKeeper) {

						/**
						 * List all coupons.
						 */
						var list = function list() {
							var vouchers = VoucherKeeper.list();
							var coupons = ArrayUtils.list(vouchers, 'type',
									'coupon');
							return coupons;
						};

						var redeem = function redeem(id) {
							if (id > 0) {
								VoucherKeeper.redeem(id, 'coupon');
							}
						};

						/**
						 * Create and return a coupon.
						 */
						var create = function create(entity, amount, remarks,
								document) {

							var coupon = null;

							if (amount > 0 && angular.isDefined(entity)) {
								coupon = VoucherKeeper.create(entity, amount,
										'coupon', remarks, document);
							}

							return coupon;
						};

						/**
						 * Cancel a coupon
						 */
						var cancel = function cancel(id) {
							if (id > 0) {
								return VoucherKeeper.cancel(id, 'coupon');
							}
						};

						this.list = list;
						this.redeem = redeem;
						this.cancel = cancel;
						this.create = create;
					});
}(angular));