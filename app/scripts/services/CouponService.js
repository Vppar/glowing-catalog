(function(angular) {
	'use strict';

	angular.module('tnt.catalog.service.coupon',
			[ 'tnt.utils.array', 'tnt.catalog.voucher.entity'])
			.service(
					'CouponService',
					function CouponService(ArrayUtils, VoucherKeeper, Voucher) {

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
							}else{
								throw "Coupon not redeem";
							}
						};

						/**
						 * Create and return a coupon.
						 */
						var create = function create(entity, amount, remarks,
								document) {
							
							if (amount > 0 && angular.isDefined(entity)) {

								var coupon = new Voucher(null, entity,
										'coupon', amount);
								coupon.remarks = remarks;
								coupon.document = document;
								
								VoucherKeeper.create(coupon);
							}else{
								throw "Coupon not created";
							}
						};

						/**
						 * Cancel a coupon
						 */
						var cancel = function cancel(id) {
							if (id > 0) {
								return VoucherKeeper.cancel(id, 'coupon');
							}else{
								throw "Coupon not canceled";
							}
						};

						this.list = list;
						this.redeem = redeem;
						this.cancel = cancel;
						this.create = create;
					});
}(angular));