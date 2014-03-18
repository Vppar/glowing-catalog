(function(angular) {
    'use strict';
    angular.module('tnt.catalog.purchase.confirm.ctrl', [
        'tnt.catalog.service.dialog', 'tnt.catalog.purchaseOrder.service', 'tnt.catalog.purchase.service'
    ]).controller(
            'PurchaseOrderConfirmCtrl',
            [
                '$scope', '$log', '$q', 'DialogService', 'PurchaseOrderService', 'NewPurchaseOrderService',
                function($scope, $log, $q, DialogService, PurchaseOrderService, NewPurchaseOrderService) {

                    // #####################################################################################################
                    // Local variables
                    // #####################################################################################################

                    // inherited object
                    var stockReport = $scope.main.stockReport;

                    // #####################################################################################################
                    // Local Functions
                    // #####################################################################################################

                    // inherited from ProductsToBuyCtrl
                    var listConfirmedProducts = function listConfirmedProducts(stockReport) {
                        var report = angular.copy(stockReport);

                        for ( var ix in report.sessions) {

                            var session = report.sessions[ix];

                            for ( var ix2 in session.lines) {
                                var line = session.lines[ix2];
                                for ( var ix3 = 0; ix3 < line.items.length;) {
                                    var item = line.items[ix3];
                                    item.qty = $scope.purchaseOrder.watchedQty[item.id];
                                    if (Number(item.qty) === 0) {
                                        line.items.splice(ix3, 1);
                                        NewPurchaseOrderService.purchaseOrder.remove(item);
                                    } else {
                                        ix3++;
                                        NewPurchaseOrderService.purchaseOrder.add(item);
                                    }
                                }
                                if (line.items.length === 0) {
                                    delete session.lines[ix2];
                                }
                            }

                            var removeSession = true;
                            for (ix2 in session.lines) {
                                removeSession = false;
                                break;
                            }
                            if (removeSession) {
                                delete report.sessions[ix];
                            }
                        }
                        return report;
                    };

                    // #####################################################################################################
                    // Scope variables
                    // #####################################################################################################

                    $scope.confirmedProducts = listConfirmedProducts(stockReport);

                    // #####################################################################################################
                    // Scope functions
                    // #####################################################################################################


                    // #####################################################################################################
                    // Publishing methods to be tested
                    // #####################################################################################################

                    this.listConfirmedProducts = listConfirmedProducts;
                }
            ]);
})(angular);
