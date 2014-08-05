(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller(
            'MainCtrl', ['$scope', '$location', 'DataProvider', 'ArrayUtils', 'OrderService', 'DialogService', 'InventoryKeeper', 'UserService', function($scope, $location, DataProvider, ArrayUtils, OrderService, DialogService, InventoryKeeper, UserService) {
               
                UserService.redirectIfInvalidUser();
                
                function dataProviderUpdate() {

                    var sections = [];
                    // var sections = ArrayUtils.distinct(DataProvider.products,
                    // 'session');
                    //
                    sections.push('Terra');
                    sections.push('Água');
                    sections.push('Fogo');
                    
                    // Ed. Limitada
                    // Lançamentos
                    // Promoções

                    $scope.sections = sections;
                }

                $scope.$on('DataProvider.update', dataProviderUpdate);
                dataProviderUpdate();

                var highlight = $location.search().highlight;
                $scope.selectedSection = highlight ? highlight : 'Mais Vendidos';

                $scope.$watch('selectedSection', function() {
                    if ($scope.sections.indexOf($scope.selectedSection) === -1) {
                        $scope.lines = [];
                    } else {
                        var products = ArrayUtils.filter(DataProvider.products, {
                            session : $scope.selectedSection
                        });
                        var lines = ArrayUtils.distinct(products, 'line');

                        $scope.lines = ArrayUtils.isIn(DataProvider.lines, 'name', lines);
                    }
                });

                $scope.selectSection = function(section) {
                    $scope.selectedSection = section;
                };

                $scope.addBestSellerToBasket = function addBestSellerToBasket(number) {
                    var product = ArrayUtils.find(DataProvider.products, 'bestSeller', number);

                    var grid = ArrayUtils.list(InventoryKeeper.read(), 'parent', product.id);

                    if (grid.length > 1) {
                        DialogService.openDialogAddToBasketDetails({
                            id : product.id,
                            showDiscount : false
                        });
                    } else {
                        DialogService.openDialogAddToBasket({
                            id : product.id,
                            showDiscount : false
                        });
                    }
                };
            }]);
}(angular));
