(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.discount', []).controller('PaymentDiscountCtrl', function($scope) {

        $scope.checkBox = {
            cred : [],
            gift : [],
            coupon : []
        };

        $scope.checkBoxCtrl = function checkBoxCtrl(index, type) {
            console.log(index);
            console.log(type);
            if ($scope.checkBox[type][index] === true) {
                    $scope.discounts[type][index].myInput = $scope.discounts[type][index].amount;
            } else {
                delete $scope.discounts[type][index].myInput;
            }
        };

        $scope.updateAmount = function updateAmount(index, type) {
            if ($scope.discounts[type][index].myInput > $scope.discounts[type][index].amount) {
                $scope.discounts[type][index].myInput = $scope.discounts[type][index].amount;
            }
        };

        $scope.confirmPayments = function confirmPayments() {
        };

    });
}(angular));
