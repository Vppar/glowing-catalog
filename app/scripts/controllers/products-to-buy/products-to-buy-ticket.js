(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller(
            'ProductsToBuyTicketCtrl', function($scope, $filter, DialogService, PurchaseOrderService) {

                $scope.purchases = PurchaseOrderService.list();
                $scope.purchase = null;

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
                
                $scope.resetWatchedQty = function(){
                    for ( var ix in $scope.purchase.items) {
                        var item = $scope.purchase.items[ix];
                        $scope.watchedQty[item.id] = 0;
                    }
                };
                
                $scope.setPurchaseOrder = function(uuid) {
                    $scope.purchase = PurchaseOrderService.read(uuid);
                    var date = new Date();
                    date.setTime($scope.purchase.created);
                    $scope.purchase.date = $filter('date')(date, 'dd/MM/yyyy');
                    $scope.resetWatchedQty();
                };

                $scope.openDialog = function(purchase) {
                    DialogService.openDialogProductsToBuyTicket(purchase).then(function(result){
                        if(result){
                            $scope.setPurchaseOrder(result.uuid);
                            $scope.selectPart('part2');
                        }
                    });
                };
                
                $scope.cancel = function(){
                    $scope.selectPart('part1');
                };

            });

}(angular));
