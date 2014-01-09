(function(angular) {
    'use strict';

    angular.module('tnt.catalog.product.input.dialog', []).controller(
            'InputProductsCtrl', function($scope, dialog, DataProvider, ArrayUtils, $filter) {

                // Local vars
                var products = DataProvider.products;
                var productsToInsert = [];
                                
                //initialize scope vars

                $scope.qtyItens = 0;
                $scope.qtyTotal= 0;
                $scope.sumTotalPrice = 0.00;
                $scope.products = products;
                $scope.selectedProduct = JSON.stringify(products[0]);
                $scope.price = JSON.parse($scope.selectedProduct).price;
                $scope.productsToInsert = productsToInsert;
                
                $scope.addToStock = function(product) {
                    var selectedProduct = JSON.parse($scope.selectedProduct);
                    selectedProduct.price = $scope.price;
                    selectedProduct.quantity = $scope.quantity;
                    
                    $scope.productsToInsert.push(selectedProduct);

                    //To keep the products list always in same order.
                    var filtratedProducts = $scope.products;

                   /* for ( var idx in $scope.productsToInsert) {
                        filtratedProducts = ArrayUtils.remove(filtratedProducts,'id',$scope.productsToInsert[idx].id);
                    }*/
                    for ( var idx in $scope.productsToInsert) {
                        filtratedProducts = ($filter('filter')(filtratedProducts, function(product) {
                            return Boolean(product.id != Number($scope.productsToInsert[idx].id));
                        }));
                    }
                    
                    
                    
                    $scope.products = filtratedProducts;
                    $scope.selectChange();
                    //set footer information
                    $scope.computeFooter();
                };

                $scope.removeFromStock = function(product) {
                    //var removedItem = ArrayUtils.remove($scope.productsToInsert,'id',product.id);
                    var removedItem = $filter('filter')($scope.productsToInsert, function(item) {
                        return Boolean(item.id != Number(product.id));
                    });
                    
                    var filtratedProducts = DataProvider.products;
                    
                    /*for(var idx in removedItem){
                        filtratedProducts = ArrayUtils.remove(filtratedProducts,'id',removedItem[idx].id);
                    }*/
                    for ( var idx in removedItem) {
                        filtratedProducts = ($filter('filter')(filtratedProducts, function(product) {
                            return Boolean(product.id != Number(removedItem[idx].id));
                        }));
                    }
                    
                    $scope.products= filtratedProducts;
                    $scope.productsToInsert = removedItem;
                    
                    $scope.computeFooter();
                };

                $scope.computeFooter = function() {
                    
                    $scope.price = $scope.products[0].price;
                    $scope.quantity = $scope.products[0].quantity;
                    
                    $scope.qtyItens = $scope.productsToInsert.length;
                    $scope.sumTotalPrice = 0;
                    $scope.qtyTotal = 0;
                    
                    for(var idx in $scope.productsToInsert){
                        $scope.sumTotalPrice = $scope.sumTotalPrice + $scope.productsToInsert[idx].price * $scope.productsToInsert[idx].quantity;
                        $scope.qtyTotal = Number($scope.qtyTotal) + Number($scope.productsToInsert[idx].quantity);
                    }
                    $scope.selectClick();
                };
                
                $scope.selectClick = function(){
                    $scope.price = JSON.parse($scope.selectedProduct).price;
                    $scope.quantity= JSON.parse($scope.selectedProduct).quantity;
                    if($scope.quantity == null ){
                        $scope.quantity = 1;
                    }
                } ;
                
                $scope.selectClick();

                $scope.changeQuantity = function(){
                    if($scope.quantity < 1 ){
                        $scope.quantity = 1;
                    }
                };
                
                $scope.changePrice = function(){
                    if($scope.quantity < 1 ){
                        $scope.quantity = 1;
                    }
                };
                
                $scope.selectChange = function(){
                    $scope.price = JSON.parse($scope.selectedProduct).price;
                };
                
                $scope.closeDialog = function() {
                    dialog.close();
                };
                
                $scope.confirmDialog = function() {
                    var products = DataProvider.products;
                    for(var idx in $scope.productsToInsert){
                        for(var idy in products ){
                            if($scope.productsToInsert[idx].id == products[idy].id){
                                products[idy]= $scope.productsToInsert[idx];
                            }
                        }
                    }
                    
                    dialog.close();
                };

                
            });
}(angular));