'use strict';

angular.module('glowingCatalogApp').controller('PaymentCheckDialogCtrl', function($scope, dialog) {

    $scope.checks = [];

    $scope.cancel = function() {
        dialog.close();
    }

    $scope.confirm = function() {
        dialog.close();
    }

    $scope.add = function() {

        if(!$scope.checkForm.$valid){
            return;
        }
        
        var check = {
            bank : $scope.bank,
            agency : $scope.agency,
            account : $scope.account,
            check : $scope.check,
            date : $scope.date,
            amount : $scope.amount
        };
        
        $scope.checks.push(check);
    };
    
    $scope.remove = function(check){
        var pos = $scope.checks.indexOf(check); 
        $scope.checks.splice(pos, 1);
    };

});
