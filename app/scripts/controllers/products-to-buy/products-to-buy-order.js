(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.order.ctrl', []).controller('ProductsToBuyOrderCtrl', function($scope) {

        var items = {};
        $scope.watchedQty = {};

        function resetWatchedQty() {
            for ( var ix in $scope.stockReport.sessions) {
                // sessions
                var session = $scope.stockReport.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        items[item.id] = item;
                        $scope.watchedQty[item.id] = item.qty;
                    }
                }
            }
        }
        resetWatchedQty();

        $scope.$watchCollection('watchedQty', function(newObj, oldObj) {
            var diff = {
                amount : 0,
                points : 0
            };
            for ( var ix in newObj) {
                var price = items[ix].price;
                var points = items[ix].points;

                diff.amount += (newObj[ix] * price);
                diff.points += (newObj[ix] * points);
            }

            $scope.$emit('productQtyChange', diff);
        });

        $scope.$on('resetWatchedQty', resetWatchedQty);

    });
}(angular));