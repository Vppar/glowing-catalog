'use strict';

angular.module('tnt.catalog.productsDelivery',['tnt.catalog.user','tnt.catalog.order.service']).controller('ProductsDeliveryCtrl', ['$filter', '$scope', 'UserService', 'OrderService', function($filter, $scope, UserService, OrderService) {
    
    UserService.redirectIfIsNotLoggedIn();
    
    $scope.orders = OrderService.list();
    
    this.getPendingProducts = function getPendingProducts() {
        var orders = angular.copy($scope.orders);
        var pendingProducts = [];
        for ( var idx in orders ) {
            for ( var ix in orders[idx].items ) {
                if ( !orders[idx].items[ix].dQty || (orders[idx].items[ix].qty - orders[idx].items[ix].dQty) > 0 ) {
                    orders[idx].items[ix].order = orders[idx].code;
                    orders[idx].items[ix].created = orders[idx].created;
                    pendingProducts.push(orders[idx].items[ix]);
                }
            }
        } 
        return pendingProducts;
    };
    
    $scope.dtFilter = {
        dtInitial : setTime(new Date(),0,0,0,0),
        dtFinal : new Date()
    };
    
    $scope.dtFilter.dtInicial = setTime(new Date(),0,0,0,0);
    
    $scope.ticket = {};
    $scope.ticket.watchedQty = {};
    $scope.ticket.checkBox = {};
    $scope.item = {id : 1, qty : 1};
    
    $scope.pendingProducts = this.getPendingProducts();
    
    var pendingProducts = $scope.pendingProducts;
    
    function setTime (date, hours, minutes, seconds, milliseconds) {
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);
        date.setMilliseconds(milliseconds);
        return date;
    }
    
    function filterProductsByDate (products) {
        return angular.copy($filter('filter')(products, filterByDate));
    }

    /**
     * DateFilter
     */
    function filterByDate (product) {
        var initialFilter = null;
        var finalFilter = null;
        var isDtInitial = false;
        var isDtFinal = false;
        if ($scope.dtFilter.dtInitial instanceof Date) {

            $scope.dtFilter.dtInitial = setTime($scope.dtFilter.dtInitial, 0, 0, 0, 0);

            initialFilter = $scope.dtFilter.dtInitial.getTime();

            isDtInitial = true;
        }
        if ($scope.dtFilter.dtFinal instanceof Date) {

            $scope.dtFilter.dtFinal = setTime($scope.dtFilter.dtFinal, 23, 59, 59, 999);
            finalFilter = $scope.dtFilter.dtFinal.getTime();

            isDtFinal = true;
        }

        if (isDtInitial && isDtFinal) {
            if ($scope.dtFilter.dtInitial.getTime() > $scope.dtFilter.dtFinal.getTime()) {
                $scope.dtFilter.dtFinal = angular.copy($scope.dtFilter.dtInitial);
            }
        }

        if (initialFilter && finalFilter) {
            if (product.created >= initialFilter && product.created <= finalFilter) {
                return true;
            }
            return false;
        } else if (initialFilter) {
            if (product.created >= initialFilter) {
                return true;
            }
            return false;
        } else if (finalFilter) {
            if (product.created <= finalFilter) {
                return true;
            }
            return false;
        } else {
            return true;
        }
    }
    
    $scope.$watchCollection('dtFilter', function () {
        $scope.pendingProducts = filterProductsByDate(pendingProducts);
    });
    
}]);
