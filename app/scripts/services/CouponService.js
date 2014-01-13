(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.coupon', [
        'tnt.catalog.voucher.entity'
    ]).service('CouponService', function CouponService(VoucherKeeper) {

    	/**
    	 * VoucherKeeper assignature
    	 * VoucherKeeper.create(obj);
    	 * VoucherKeeper.redeem(id);
    	 * VoucherKeeper.cancel(id);
    	 */
    	
        
        /**
         * List all coupons.
         */
    	var add = function add(coupon){
    		VoucherKeeper.add();
    	};
    	
        var list = function list() {
            return VoucherKeeper.list();
        };
      
        var redeem = function redeem(id){
        	return VoucherKeeper.redeem(id);
        };
        
        var create = function createCoupon(){
        	return coupon;
        };
        
        var cancel = function cancel(id){
        	return VoucherKeeper.cancel(id);
        };
                
        this.add = add;
        this.redeem = redeem;
        this.cancel = cancel;
        this.create = create;
    });
}(angular));