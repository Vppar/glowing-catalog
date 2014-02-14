(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.dialog.ctrl', []).controller('ProductsToBuyTicketDialogCtrl', function($scope, $q, $filter, dialog) {

        $scope.nfe = {
                date : new Date(),
                total : '',
                shipping : '',
                order : '',
                number : '',
                disable : true
        };
        
        $scope.$watchCollection('nfe', function() {
            var result = true;
            result = result && ($scope.nfe.date && $scope.nfe.date != '');
            result = result && ($scope.nfe.number && $scope.nfe.number != '');
            result = result && ($scope.nfe.total && $scope.nfe.total != '');
            result = result && ($scope.nfe.order && $scope.nfe.order != '');
            $scope.nfe.disable = !result;
        });
        
        $scope.cancel = function cancel() {
            dialog.close($q.reject());
        };

        $scope.confirm = function confirm() {
            delete $scope.nfe.disabled;
            dialog.data.nfe = $scope.nfe;
            dialog.close(dialog.data);
        };
        
    });

}(angular));