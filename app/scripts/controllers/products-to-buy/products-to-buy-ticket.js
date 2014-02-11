(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller('ProductsToBuyTicketCtrl', function($scope, DialogService) {

        $scope.selectedPart = 'part1';
        
        $scope.watchedQty = {};

        $scope.selectPart = function(part) {
            $scope.selectedPart = part;
        };
        
        $scope.openDialog = function(){
            
            DialogService.openDialogProductsToBuyTicket({
                idDelievery : null
            });
        };
        
    });

}(angular));
