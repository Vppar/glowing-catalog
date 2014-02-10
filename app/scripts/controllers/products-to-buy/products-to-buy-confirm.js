(function(angular) {
    'use strict';

    angular.module('tnt.catalog.productsToBuy.confirm.ctrl', []).controller(
            'ProductsToBuyConfirmCtrl',
            function($scope, $log) {

                // inherited from ProductsToBuyCtrl
                var listConfirmedProducts = function listConfirmedProducts(stockReport) {
                    var report = angular.copy(stockReport);
                    for ( var ix in report.sessions) {

                        var session = report.sessions[ix];

                        for ( var ix2 in session.lines) {
                            var line = session.lines[ix2];
                            for ( var ix3 = 0; ix3 < line.items.length;) {
                                var item = line.items[ix3];
                                if (item.qty === 0) {
                                    line.items.splice(ix3, 1);
                                } else {
                                    ix3++;
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

                $scope.$on('updateConfirmed', function() {
                    // current time for log
                    var processStarted = new Date().getTime();

                    $scope.confirmedProducts = listConfirmedProducts($scope.stockReport);

                    var processDone = new Date().getTime();
                    $log.debug('ProductsToBuyConfirmCtrl.on(updateConfirmed): -It took ' + (processDone - processStarted) +
                        'ms to updateConfirmed list.');

                });

                this.listConfirmedProducts = listConfirmedProducts;
            });
}(angular));