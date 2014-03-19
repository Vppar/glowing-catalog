(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.voucher.ctrl',
            [
                'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.utils.array', 'tnt.catalog.payment.service',
                'tnt.catalog.entity.service'
            ]).controller(
            'VoucherCtrl',
            [
                '$scope', '$filter', 'VoucherKeeper', 'ArrayUtils', 'PaymentService', 'OrderService', 'EntityService', 'UserService',
                function($scope, $filter, VoucherKeeper, ArrayUtils, PaymentService, OrderService, EntityService, UserService) {

                    UserService.redirectIfIsNotLoggedIn();

                    /**
                     * The real deal
                     */

                    $scope.vouchers = [];

                    var vouchersList = VoucherKeeper.list('voucher');
                    var couponList = VoucherKeeper.list('coupon');
                    var giftList = VoucherKeeper.list('giftCard');

                    for ( var ix in vouchersList) {
                        var entity = EntityService.read(vouchersList[ix].entity);
                        vouchersList[ix].entity = entity ? entity.name : '';
                        vouchersList[ix].type = 'Vale Crédito';
                        $scope.vouchers.push(vouchersList[ix]);
                    }
                    for ( var ix in couponList) {
                        var entity = EntityService.read(couponList[ix].entity);
                        couponList[ix].entity = entity ? entity.name : '';
                        couponList[ix].type = 'Coupon';
                        $scope.vouchers.push(couponList[ix]);
                    }
                    for ( var ix in giftList) {
                        var entity = EntityService.read(giftList[ix].entity);
                        giftList[ix].entity = entity ? entity.name : '';
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

                }
            ]);
}(angular));