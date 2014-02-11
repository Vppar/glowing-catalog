(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.dialog.ctrl', []).controller('ProductsToBuyTicketDialogCtrl', function($scope, $q, dialog) {

        $scope.cancel = function cancel() {
            dialog.close($q.reject());
        };

        $scope.back = function back() {
            dialog.close(true);
        };
        
    });

}(angular));