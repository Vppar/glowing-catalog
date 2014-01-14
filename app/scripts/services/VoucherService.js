(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.service', [
        'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper', 'tnt.catalog.entity.service', 'tnt.utils.array'
    ]).service('VoucherService', function VoucherService(Voucher, VoucherKeeper, EntityService, ArrayUtils) {

        var voucherType = 'voucher';

        this.create = function(entity, amount, remarks, document) {
            // is it a valid entity?
            if(EntityService.find(entity)===null){
                throw 'invalid entity.'; 
            }
            // is the amount sane?
            /**
             * non negative
             * 
             */
            if(amount<0){
                throw 'we can not give negative amounts';
            }
            
            // is it a valid document?
            
            var voucher = new Voucher(null, entity, voucherType, amount);

            VoucherKeeper.create(voucher);
        };

        this.redeem = function(id) {
            var voucher = ArrayUtils(VoucherKeeper.list(voucherType), 'id', id);
            if (voucher === undefined) {
                throw 'voucher not found.';
            }

            // is this voucher still valid?
            /**
             * TODO - vouchers doesn't have date yet.
             */
            // is it not canceled?
            if (voucher.canceled === true) {
                throw 'the required voucher is canceled.';
            }
            // is it unredeemed?
            if (voucher.redeemed === true) {
                throw 'the required voucher has been already redeemed.';
            }
            // if so, lets do it!
            VoucherKeeper.redeem(voucherType, id);
        };

        this.cancel = function(id) {
            var voucher = ArrayUtils(VoucherKeeper.list(voucherType), 'id', id);
            if (voucher === undefined) {
                throw 'voucher not found.';
            }

            // is it unredeemed?
            if (voucher.redeemed === true) {
                throw 'the required voucher has been already redeemed.';
            }

            // is this voucher still valid?
            /**
             * TODO - vouchers doesn't have date yet.
             */

            // is it not canceled?
            if (voucher.canceled === true) {
                throw 'the required voucher is canceled.';
            }
            VoucherKeeper.cancel(voucherType, id);
        };

    });
})(angular);
