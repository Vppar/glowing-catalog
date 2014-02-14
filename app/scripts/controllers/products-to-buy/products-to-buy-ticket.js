(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', [
        'tnt.utils.array'
    ]).controller('ProductsToBuyTicketCtrl', function($scope, $filter, $q, ArrayUtils, DialogService, PurchaseOrderService) {

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
            $scope.purchaseOrder = PurchaseOrderService.filterReceived(purchaseOrder);
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
            var receivedPromises = [];
            for ( var ix in ticket.watchedQty) {
                var item = ArrayUtils.find($scope.purchaseOrder.items, 'id', Number(ix));
                var receiveQty = item.qty - ticket.watchedQty[ix];
                if (receiveQty > 0) {
                    var receivedPromise = PurchaseOrderService.receive($scope.purchaseOrder.uuid, ix, ticket.nfeData.number, receiveQty);
                    receivedPromises.push(receivedPromise);
                }
            }

            $q.all(receivedPromises).then(function() {
                PurchaseOrderService.redeem($scope.purchaseOrder.uuid);
                selectPart('part1');
                ticket.loadPurchaseOrders();
            });
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
