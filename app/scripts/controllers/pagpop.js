'use strict';

angular.module('tnt.catalog.pagpop', [
    'tnt.catalog.user', 'tnt.catalog.receivable.service', 'tnt.utils.array'
])
        .controller(
                'PagpopCtrl',
                [
                 '$scope',
                 'UserService',
                 'ReceivableService',
                 'ArrayUtils',
                    function($scope, UserService, ReceivableService, ArrayUtils) {
                     
                     UserService.redirectIfIsNotLoggedIn();
                     
                     var receivables = ReceivableService.list();
                     var creditCardReceivables = ArrayUtils.list(receivables, 'type', 'creditCard');
                     $scope.ccReceivables = creditCardReceivables;
                     
                     $scope.total = 0;
                     for(var idx in $scope.ccReceivables){
                         $scope.total += $scope.ccReceivables[idx].amount;
                     }
                     
                     var payments = ArrayUtils.distinct($scope.ccReceivables, 'payment');
                     $scope.numCustomers = ArrayUtils.distinct(payments, 'owner').length;
                     
                     $scope.numOrders = ArrayUtils.distinct($scope.ccReceivables, 'uuid').length;
                    }
                ]);
