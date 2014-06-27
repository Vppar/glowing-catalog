(function(angular) {
    'use strict';

    angular.module('tnt.catalog.purchase.ticket.ctrl', [
        'tnt.utils.array', 'tnt.catalog.service.dialog', 'tnt.catalog.purchaseOrder.service', 'tnt.catalog.purchase.service'
    ]).controller(
            'PurchaseOrderTicketCtrl',
            [
                '$scope',
                '$filter',
                '$q',
                '$log',
                'ArrayUtils',
                'DialogService',
                'PurchaseOrderService',
                'NewPurchaseOrderService',
                function($scope, $filter, $q, $log, ArrayUtils, DialogService, PurchaseOrderService, NewPurchaseOrderService) {

                    // #####################################################################################################
                    // Local variables
                    // #####################################################################################################
                    var ticket = $scope.ticket;
                    ticket.tab = 'open';
                    var value = true;

                    var resetPurchaseOrder = $scope.resetPurchaseOrder;

                    var resetWatchedQty = function resetWatchedQty() {
                        $scope.ticket.watchedQty = {};
                        $scope.ticket.checkBox = {};
                        value = true;
                        for ( var ix in $scope.purchaseOrder.items) {
                            var item = $scope.purchaseOrder.items[ix];
                            $scope.ticket.watchedQty[item.id] = 0;
                            $scope.ticket.checkBox[item.id] = 0;
                        }
                    };

                    this.resetWatchedQty = resetWatchedQty;

                    var setPurchaseOrder = function setPurchaseOrder(purchaseOrder) {
                        $scope.purchaseOrder = PurchaseOrderService.filterReceived(purchaseOrder);
                        resetWatchedQty();
                    };

                    this.setPurchaseOrder = setPurchaseOrder;

                    var selectPart = function selectPart(part) {
                        ticket.selectedPart = part;
                    };

                    ticket.loadPurchaseOrders = function(){
                        ticket.purchaseOrders = $filter('filter')(NewPurchaseOrderService.list(), $scope.filterOrders);
                    };

                    // #####################################################################################################
                    // Scope functions
                    // #####################################################################################################

                    $scope.openDialog = function(purchaseOrder) {
                        if (angular.isUndefined(purchaseOrder.received)) {
                            var nfePromise = DialogService.openDialogPurchaseOrderTicket(purchaseOrder);
                            nfePromise.then(function(result) {
                                if (result) {
                                    ticket.nfeData = result.nfe;
                                    purchaseOrder.nfe = result.nfe;
                                    setPurchaseOrder(purchaseOrder);
                                    selectPart('part2');
                                }
                            });
                        }
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

                    $scope.confirm =
                            function() {
                                var receivedPromises = [];
                                for ( var ix in ticket.watchedQty) {
                                    var item = ArrayUtils.find($scope.purchaseOrder.items, 'id', Number(ix));
                                    var receiveQty = item.qty - ticket.watchedQty[ix];
                                    if (receiveQty > 0) {
                                        var receivedPromise =
                                                PurchaseOrderService.receiveProduct(
                                                        $scope.purchaseOrder.uuid, ix, ticket.nfeData, receiveQty);
                                        receivedPromises.push(receivedPromise);
                                    }
                                }

                                var redeemedPromise = $q.all(receivedPromises).then(function() {
                                    return PurchaseOrderService.receive($scope.purchaseOrder.uuid, ticket.nfeData.order);
                                });

                                redeemedPromise.then(function() {
                                    ticket.loadPurchaseOrders();
                                    selectPart('part1');
                                    resetPurchaseOrder();
                                });

                                return redeemedPromise;
                            };

                    $scope.changeTab = function changeTab(tab) {
                        $scope.ticket.tab = tab;
                        ticket.loadPurchaseOrders();
                    };

                    $scope.selectAll = function(){
                        var boxes = $scope.ticket.checkBox;
                        for(var ix in boxes){
                            boxes[ix] = value;
                        }

                        value = !value;
                    };

                    $scope.filterOrders = function filterOrders(purchase) {
                        if (purchase.status < 3) {
                            return false;
                        }
                        return purchase.status === 3 || purchase.status === 4 || $scope.ticket.tab === 'all';
                    };

                    $scope.cancel = function() {
                        selectPart('part1');
                    };

                    // #####################################################################################################
                    // Controller warm up
                    // #####################################################################################################

                    ticket.loadPurchaseOrders();
                }
            ]);

})(angular);
