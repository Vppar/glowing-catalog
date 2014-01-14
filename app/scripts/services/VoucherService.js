(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.service', []).service('VoucherService', function VoucherService(VoucherKeeper) {
        
        var voucherType = 'voucher';

        this.create = function(entity, amount, remarks, document){
            // is it a valid entity?
            // is the amount sane?
            // is it a valid document?
            
            var voucher = new Voucher(null, entity, voucherType, amount);
            
            VoucherKeeper.create(voucher);
        };
        
        this.redeem = function(id){
            // is this voucher still valid?
            // is it unredeemed?
            // if so, lets do it!
        };
        
        this.cancel = function(id){
            // is this voucher unredeemed?
            // is it valid?
            // is it not canceled?
        };
        
        
    });
})(angular);
