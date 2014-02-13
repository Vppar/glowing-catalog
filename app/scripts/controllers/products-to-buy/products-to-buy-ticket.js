(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.ticket.ctrl', []).controller(
            'ProductsToBuyTicketCtrl', function($scope, $filter, DialogService, PurchaseOrderService, ArrayUtils) {

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

                var validatePending = function validatePending() {
                    var x = 0;
                    $scope.enableButton = false;
                    for ( var i in $scope.ticket.watchedQty) {
                        if ($scope.checkBox[i] || ($scope.ticket.watchedQty[i] !== 0)) {
                            $scope.purchase.items[x].valid = true;
                            $scope.enableButton = true;
                        } else {
                            $scope.purchase.items[x].valid = false;
                        }
                        x++;
                    }
                };

                // #####################################################################################################
                // Scope functions
                // #####################################################################################################

                $scope.checkBox = [];

                $scope.enableButton = false;

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

                $scope.$watchCollection('checkBox', function() {
                    validatePending();
                });

                $scope.$watchCollection('ticket.watchedQty', function() {
                    validatePending();
                });

                $scope.cancel = function() {
                    selectPart('part1');
                };

                // #####################################################################################################
                // Controller warm up
                // #####################################################################################################

                ticket.loadPurchaseOrders();
            });

}(angular));
