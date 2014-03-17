(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.receive.ctrl', []).controller(
        'ReceivableReceiveCtrl',
        [
            '$scope',
            '$filter',
            'ReceivableService',
            'BookService',
            'DialogService',
            function ($scope, $filter, ReceivableService, BookService, DialogService) {

                $scope.negotiate = false;
                $scope.extra = 0;
                $scope.discount = 0;
                $scope.openReceivable = function () {
                    DialogService.openDialogReceivable($scope.selectedReceivable).then(function () {
                        $scope.clearSelectedReceivable();
                    }, function (err) {
                        // err = type of receivable. 3 = check
                        /*if (err === '3') {
                            $scope.receivableType = $scope.negotiation();
                        }*/
                    });
                };

                $scope.negotiation = function () {
                    $scope.negotiate = true;
                };
                
                 /**
                 * Verifies if a receivable is valid.
                 * 
                 * @returns boolean
                 */
                $scope.isValid = function isValid (receivable) {
                    var result = true;
                    if (angular.isDefined(receivable.amount) && receivable.amount <= 0) {
                        result = false;
                    }
                    return result;
                };
            }
        ]);
}(angular));