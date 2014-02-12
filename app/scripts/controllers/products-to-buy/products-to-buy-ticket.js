(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller(
            'ProductsToBuyTicketCtrl', function($scope, $filter, DialogService, PurchaseOrderService) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                var ticket = $scope.ticket;
                var resetWatchedQty = function resetWatchedQty() {
                    for ( var ix in $scope.purchase.items) {
                        var item = $scope.purchase.items[ix];
                        $scope.ticket.watchedQty[item.id] = 0;
                    }
                };

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################

                $scope.selectPart = function(part) {
                    ticket.selectedPart = part;
                };

                $scope.setPurchaseOrder = function(uuid) {
                    $scope.purchase = PurchaseOrderService.read(uuid);

                    var date = new Date();
                    date.setTime($scope.purchase.created);
                    $scope.purchase.date = $filter('date')(date, 'dd/MM/yyyy');

                    resetWatchedQty();
                };

                $scope.openDialog = function(purchase) {
                    DialogService.openDialogProductsToBuyTicket(purchase).then(function(result) {
                        if (result) {
                            $scope.setPurchaseOrder(result.uuid);
                            $scope.selectPart('part2');
                        }
                    });
                };

                $scope.cancel = function() {
                    $scope.selectPart('part1');
                };

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################

                ticket.loadPurchaseOrders();
            });

}(angular));
