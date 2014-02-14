(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller(
            'ProductsToBuyTicketCtrl', function($scope, $filter, DialogService, PurchaseOrderService) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                var ticket = $scope.ticket;

                var resetWatchedQty = function resetWatchedQty() {
                    $scope.ticket.watchedQty = {};
                    $scope.ticket.checkBox = {};
                    for ( var ix in $scope.purchaseOrder.items) {
                        var item = $scope.purchaseOrder.items[ix];
                        $scope.ticket.watchedQty[item.id] = 0;
                        $scope.ticket.checkBox[item.id] = 0;
                    }
                };

                var setPurchaseOrder = function setPurchaseOrder(purchaseOrder) {
                    var filteredPurchaseOrder = PurchaseOrderService.filterReceived(purchaseOrder);

                    var date = new Date();
                    date.setTime(filteredPurchaseOrder.created);
                    filteredPurchaseOrder.date = date;

                    $scope.purchaseOrder = filteredPurchaseOrder;

                    resetWatchedQty();
                };

                var selectPart = function selectPart(part) {
                    ticket.selectedPart = part;
                };

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################

                $scope.openDialog = function(purchaseOrder) {
                    var nfePromise = DialogService.openDialogProductsToBuyTicket(purchaseOrder);
                    nfePromise.then(function(result) {
                        if (result) {
                            ticket.nfeData = result.nfe;
                            setPurchaseOrder(purchaseOrder);
                            selectPart('part2');
                        }
                    });
                };

                $scope.disableButton = function disableButton() {
                    var result = false;
                    for ( var ix in ticket.watchedQty) {
                        if (!$scope.ticket.checkBox[ix] && (ticket.watchedQty[ix] === 0)) {
                            result = true;
                        }
                    }
                    return result;
                };

                $scope.confirm = function() {
                    for ( var ix in ticket.watchedQty) {
                        if (ticket.checkBox[ix]) {
                            PurchaseOrderService.receive($scope.purchaseOrder.uuid, ix, ticket.nfeData.number);
                        } else {
                            PurchaseOrderService.receive($scope.purchaseOrder.uuid, ix, ticket.nfeData.number, ticket.watchedQty[ix]);
                        }
                    }
                    PurchaseOrderService.redeem($scope.purchaseOrder.uuid);
                    resetWatchedQty();
                    selectPart('part1');
                };

                $scope.cancel = function() {
                    selectPart('part1');
                };

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################

                ticket.loadPurchaseOrders();
            });

}(angular));
