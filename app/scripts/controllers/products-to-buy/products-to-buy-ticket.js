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

                var setPurchaseOrder = function setPurchaseOrder(uuid) {
                    $scope.purchase = PurchaseOrderService.read(uuid);

                    var date = new Date();
                    date.setTime($scope.purchase.created);
                    $scope.purchase.date = $filter('date')(date, 'dd/MM/yyyy');

                    resetWatchedQty();
                };
                var selectPart = function selectPart(part) {
                    ticket.selectedPart = part;
                };

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################

                $scope.tab = 'open';
                
                $scope.checkBox = [];

                $scope.openDialog = function(purchase) {
                    var nfePromise = DialogService.openDialogProductsToBuyTicket(purchase);
                    nfePromise.then(function(result) {
                        if (result) {
                            ticket.nfeData = result.nfe;
                            setPurchaseOrder(result.uuid);
                            selectPart('part2');
                        }
                    });
                };

                $scope.disableButton = function disableButton() {
                    var result = false;
                    for ( var i in $scope.ticket.watchedQty) {
                        if (!$scope.checkBox[i] && ($scope.ticket.watchedQty[i] === 0)) {
                            result = true;
                        }
                    }
                    return result;
                };
                
                $scope.changeTab = function changeTab(tab){
                    $scope.tab = tab;
                };
                
                $scope.filterOrders = function filterOrders(purchase){
                    return angular.isUndefined(purchase.received) || $scope.tab==='all';
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
