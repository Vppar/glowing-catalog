(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller('ProductsToBuyTicketCtrl', function($scope) {

        $scope.selectedPart = 'part1';

        $scope.selectPart = function(part) {
            $scope.selectedPart = part;
        };
    });

}(angular));
