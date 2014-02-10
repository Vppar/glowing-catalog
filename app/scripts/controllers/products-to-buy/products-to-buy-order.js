(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.order.ctrl', []).controller('ProductsToBuyOrderCtrl', function($scope) {

        $scope.watchedQty = {};
        $scope.products = $scope.productsToBuy;

        for ( var ix in $scope.products.sessions) {
            // sessions
            var session = $scope.products.sessions[ix];
            // lines of that session
            for ( var ix2 in session.lines) {
                // lines
                var line = session.lines[ix2];
                // items of that line
                for ( var ix3 in line.items) {
                    var product = line.items[ix3];
                    $scope.watchedQty[product.id] = product.qty;
                }
            }
        }

        $scope.$watchCollection('watchedQty', function(newObj, oldObj) {
            $scope.$emit('productQtyChange', $scope.watchedQty);
        });
    });
}(angular));