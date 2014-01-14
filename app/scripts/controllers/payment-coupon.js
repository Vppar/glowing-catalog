(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.coupon', [
        'tnt.catalog.filter.findBy'
    ]).controller('PaymentCouponCtrl', function($scope, $element, $filter, $log, PaymentService) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        var couponValueTemplate = {
            amount : null,
            qty : 0,
            total : null
        };

        var five = {};
        var ten = {};
        var twenty = {};
        var thirty = {};

        angular.extend(five, couponValueTemplate);
        angular.extend(ten, couponValueTemplate);
        angular.extend(twenty, couponValueTemplate);
        angular.extend(thirty, couponValueTemplate);

        $scope.five = five;
        five.amount = 5;
        $scope.ten = ten;
        ten.amount = 10;
        $scope.twenty = twenty;
        twenty.amount = 20;
        $scope.thirty = thirty;
        thirty = 30;

    });
}(angular));
