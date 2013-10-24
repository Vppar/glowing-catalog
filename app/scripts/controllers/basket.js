(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller('BasketCtrl', function($scope, $dialog, $location, DataProvider) {

        $scope.dataProvider = DataProvider;

        $scope.remove = function remove(index) {
            $scope.dataProvider.products.splice(index, 1);
        };
        
        $scope.filterQtde = function(product){
            return product.qtde;
        };

        $scope.openDialogEditPass = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/global/edit-pass-dialog.html', 'EditPassDialogCtrl');
        };
        $scope.openDialogChooseCustomer = function() {
            var d = $dialog.dialog({
                backdropClick : true,
                dialogClass : 'modal'
            });
            d.open('views/parts/global/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
        };
        
        $scope.pay = function(){
            $location.path("/payment");
        };
        
    });
}(angular));