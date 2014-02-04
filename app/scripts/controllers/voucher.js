(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller('VoucherCtrl', function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService, OrderService, EntityService) {

        /**
         * The real deal
         */

        $scope.vouchers = [];

        var vouchersList = VoucherKeeper.list('voucher');
        var couponList = VoucherKeeper.list('coupon');
        var giftList = VoucherKeeper.list('giftCard');
        for ( var ix in vouchersList) {
            vouchersList[ix].entity = EntityService.read(vouchersList[ix].entity).name;
            vouchersList[ix].type = 'Vale Crédito';
            $scope.vouchers.push(vouchersList[ix]);
        }
        for ( var ix in couponList) {
            couponList[ix].entity = EntityService.read(couponList[ix].entity).name;
            couponList[ix].type = 'Coupon';
            $scope.vouchers.push(couponList[ix]);
        }
        for ( var ix in giftList) {
            giftList[ix].entity = EntityService.read(giftList[ix].entity).name;
            giftList[ix].type = 'Vale Presente';
            $scope.vouchers.push(giftList[ix]);
        }

        $scope.voucherFilter = {
            value : '',
            date : new Date()
        };

        $scope.historicVoucher = {
            dtInitial : new Date(),
            dtFinal : new Date(),
            value : ''
        };

        // Set first and last instants of dates.
        $scope.voucherFilter.date.setHours(0);
        $scope.voucherFilter.date.setMinutes(0);
        $scope.voucherFilter.date.setSeconds(0);
        $scope.historicVoucher.dtInitial.setHours(0);
        $scope.historicVoucher.dtInitial.setMinutes(0);
        $scope.historicVoucher.dtInitial.setSeconds(0);
        $scope.historicVoucher.dtFinal.setHours(23);
        $scope.historicVoucher.dtFinal.setMinutes(59);
        $scope.historicVoucher.dtFinal.setSeconds(59);

    });
}(angular));