(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.coupon', [
        'tnt.catalog.filter.findBy'
    ]).controller('PaymentCouponCtrl', function($scope) {

        // #####################################################################################################
        // Warm up the controller
        // #####################################################################################################

        $scope.total = 0;
        
        $scope.list = [
            {
                qty : 0,
                amount : 5
            }, {
                qty : 0,
                amount : 10
            }, {
                qty : 0,
                amount : 20
            }, {
                qty : 0,
                amount : 30
            },
        ];

        function updateTotal() {
            $scope.total = 0;

            for ( var ix in $scope.list) {
                
                $scope.list[ix].total = $scope.list[ix].qty * $scope.list[ix].amount;
                $scope.total += $scope.list[ix].total;
            }
        }

        for ( var ix in $scope.list) {
            $scope.$watch('list[' + ix + '].qty', updateTotal);
        }

        // TODO integrate with coupon service.
    });
}(angular));
