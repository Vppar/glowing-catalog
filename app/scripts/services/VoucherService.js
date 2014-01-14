(function(angular) {
    'use strict';

    angular.module('tnt.catalog.voucher.service', [
        'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper', 'tnt.catalog.entity.service', 'tnt.utils.array'
    ]).service('VoucherService', function VoucherService(Voucher, VoucherKeeper, EntityService, ArrayUtils) {

        var voucherType = 'voucher';

        this.create = function(entity, amount, remarks, document) {
            // is it a valid entity?
            if (EntityService.find(entity) === undefined) {
                throw 'invalid entity.';
            }
            // is the amount sane?
            if (amount < 0 || amount > 200) {
                throw 'invalid amount. The value shoud be between 0 and 200.';
            }

            // is it a valid document?
            /**
             * TODO - waiting until the document have some implementation.
             */
            var voucher = new Voucher(null, entity, voucherType, amount);
            voucher.remarks = remarks;
            voucher.document = document;

            VoucherKeeper.create(voucher);
        };

        this.redeem = function(id) {
            var voucher = ArrayUtils.find(VoucherKeeper.list(voucherType), 'id', id);
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
            var voucher = ArrayUtils.find(VoucherKeeper.list(voucherType), 'id', id);
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
