(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller(
            'ProductsToBuyTicketCtrl', function($scope, DialogService, PurchaseOrderService) {

                 $scope.purchases = PurchaseOrderService.list();

                $scope.$watchCollection('selectedTab', function() {
                    $scope.purchases = PurchaseOrderService.list();
                    
                    for(var i in $scope.purchases){
                        var purchase = $scope.purchases[i];
                        var sum = 0;
                        for(var i2 in purchase.items){
                            sum += purchase.items[i2].price;
                        }
                        $scope.purchases[i].amount = sum;
                    }
                });

                $scope.selectedPart = 'part1';

                $scope.watchedQty = {};

                $scope.selectPart = function(part) {
                    $scope.selectedPart = part;
                };

                $scope.openDialog = function() {

                    DialogService.openDialogProductsToBuyTicket({
                        idDelievery : null
                    });
                };

            });

}(angular));