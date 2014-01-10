(function(angular) {
    'use strict';

    angular.module('tnt.catalog.product.input.dialog', []).controller(
            'InputProductsCtrl',
            function($scope, dialog, DataProvider, ArrayUtils, $filter) {

                // Local vars
                var products = DataProvider.products;
                var productsToInsert = [];

                // initialize scope vars
                $scope.qtyItens = 0;
                $scope.qtyTotal = 0;
                $scope.sumTotalPrice = 0.00;
                $scope.products = products;
                $scope.selectedProduct = JSON.stringify(products[0]);
                $scope.price = JSON.parse($scope.selectedProduct).price;
                $scope.quantity = 1;
                $scope.productsToInsert = productsToInsert;

                $scope.addToStock = function(product) {
                    var selectedProduct = JSON.parse($scope.selectedProduct);
                    selectedProduct.price = $scope.price;
                    selectedProduct.quantity = $scope.quantity;

                    $scope.productsToInsert.push(selectedProduct);

                    var filtratedProducts = $scope.products;

                    for ( var idx in $scope.productsToInsert) {
                        filtratedProducts = ($filter('filter')(filtratedProducts, function(product) {
                            return Boolean(product.id != Number($scope.productsToInsert[idx].id));
                        }));
                    }

                    $scope.products = filtratedProducts;
                    $scope.computeTotals();
                };

                $scope.removeFromStock = function(product) {
                    var removedItem = $filter('filter')($scope.productsToInsert, function(item) {
                        return Boolean(item.id != Number(product.id));
                    });
                    
                    var filtratedProducts = DataProvider.products;

                    for ( var idx in removedItem) {
                        filtratedProducts = ($filter('filter')(filtratedProducts, function(product) {
                            return Boolean(product.id != Number(removedItem[idx].id));
                        }));
                    }

                    $scope.products = filtratedProducts;
                    $scope.productsToInsert = removedItem;
                    $scope.computeTotals();
                };

                $scope.computeTotals = function() {
                            $scope.qtyItens = $scope.productsToInsert.length;
                            $scope.sumTotalPrice = 0;
                            $scope.qtyTotal = 0;

                            for ( var idx in $scope.productsToInsert) {
                                $scope.sumTotalPrice = $scope.sumTotalPrice + 
                                                        $scope.productsToInsert[idx].price * 
                                                        $scope.productsToInsert[idx].quantity;
                                $scope.qtyTotal = Number($scope.qtyTotal) + 
                                                    Number($scope.productsToInsert[idx].quantity);
                            }
                };

                $scope.selectChange = function() {
                    $scope.price = JSON.parse($scope.selectedProduct).price;
                    $scope.quantity = JSON.parse($scope.selectedProduct).quantity;
                    if ($scope.quantity == null) {
                        $scope.quantity = 1;
                    }
                };

                $scope.closeDialog = function() {
                    dialog.close();
                };

                $scope.confirmDialog = function() {
                    var products = DataProvider.products;
                    for ( var idx in $scope.productsToInsert) {
                        for ( var idy in products) {
                            if ($scope.productsToInsert[idx].id == products[idy].id) {
                                products[idy] = $scope.productsToInsert[idx];
                            }
                        }
                    }
                    //list products contain only changed products
                    //TODO call persist logic
                    dialog.close();
                };

            });
}(angular));