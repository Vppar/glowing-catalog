(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.credit.ctrl', [
        'tnt.catalog.purchaseOrder.service'
    ]).controller('ProductsToBuyCreditCtrl', ['$scope', '$filter', 'PurchaseOrderService', function($scope, $filter, PurchaseOrderService) {

        $scope.purchase = {
            order : {}
        };

        $scope.today = new Date();

        $scope.credit = {
            dtInitial : new Date(),
            dtFinal : new Date()
        };

        $scope.$watchCollection('credit', function() {
            $scope.filter();
        });

        $scope.filter = function() {
        };

        /**
         * Historic DateFilter
         */
        function dateFilter(purchase) {
            var initialFilter = null;
            var finalFilter = null;
            var isDateInitial = false;
            var isDateFinal = false;
            if ($scope.credit.dtInitial instanceof Date) {

                $scope.credit.dtInitial.setHours(0);
                $scope.credit.dtInitial.setMinutes(0);
                $scope.credit.dtInitial.setSeconds(0);

                initialFilter = $scope.credit.dtInitial.getTime();

                isDateInitial = true;
            }

            if ($scope.credit.dtFinal instanceof Date) {

                $scope.credit.dtFinal.setHours(23);
                $scope.credit.dtFinal.setMinutes(59);
                $scope.credit.dtFinal.setSeconds(59);

                finalFilter = $scope.credit.dtFinal.getTime();

                isDateFinal = true;
            }

            if (isDateInitial && isDateFinal) {
                if ($scope.credit.dtInitial.getTime() > $scope.credit.dtFinal.getTime()) {
                    $scope.credit.dtFinal = angular.copy($scope.credit.dtInitial);
                }
            }

            if (initialFilter && finalFilter) {
                if (purchase.created >= initialFilter && purchase.created <= finalFilter) {
                    return true;
                }
                return false;
            } else if (initialFilter) {
                if (purchase.created >= initialFilter) {
                    return true;
                }
                return false;
            } else if (finalFilter) {
                if (purchase.created <= finalFilter) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        }

    }]);
}(angular));