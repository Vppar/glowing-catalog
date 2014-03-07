(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.coupon', [
        'tnt.utils.array', 'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper'
    ]).service('CouponService', ['ArrayUtils', 'VoucherKeeper', 'Voucher', function CouponService(ArrayUtils, VoucherKeeper, Voucher) {

        /**
         * List all coupons.
         */
        var list = function list() {
            var vouchers = VoucherKeeper.list();
            var coupons = ArrayUtils.list(vouchers, 'type', 'coupon');
            return coupons;
        };

        var redeem = function redeem(id) {
            if (id > 0) {
                VoucherKeeper.redeem('coupon', id);
            } else {
                throw 'Coupon not redeem';
            }
        };

        /**
         * Create and return a coupon.
         */
        var create = function create(entity, amount, remarks) {
            var coupon = new Voucher(null, entity, 'coupon', amount);
            coupon.remarks = remarks;
            
            var result = VoucherKeeper.create(coupon);
            result['catch'](function(err) {
                $log.error('CouponService.create: -Failed to create a voucher. ', err);
            });
            return result;
        };

        /**
         * Cancel a coupon
         */
        var cancel = function cancel(id) {
            if (id > 0) {
                return VoucherKeeper.cancel('coupon', id);
            } else {
                throw 'Coupon not canceled';
            }
        };

        this.list = list;
        this.redeem = redeem;
        this.cancel = cancel;
        this.create = create;
    }]);
}(angular));