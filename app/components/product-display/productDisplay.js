(function(angular) {
    'use strict';

    var templateUrl = 'components/product-display/product-display.html';

    // angular.module('tnt.catalog.components.product-display.template',
    // []).run(function($http, $templateCache) {
    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.catalog.components.product-display', []).directive(
            'productDisplay', ['DataProvider', 'OrderService', 'DialogService', 'InventoryKeeper', 'ArrayUtils', function(DataProvider, OrderService, DialogService, InventoryKeeper, ArrayUtils) {
                return {
                    restrict : 'E',
                    templateUrl : templateUrl,
                    replace : true,
                    scope : {
                        product : '=',
                        color : '='
                    },
                    link : function postLink(scope, element, attrs) {
                        
                        scope.getImageData = function(name){
                            return DataProvider.images[name];
                        };

                        scope.blockStyle = [];
                        scope.blockStyle[0] = 'w0' + scope.product.w;
                        scope.blockStyle[1] = 'h0' + scope.product.h;
                        scope.blockStyle[2] = 'product-bg-' + scope.color;

                        if (angular.isDefined(scope.product.expires)) {
                            scope.blockStyle[3] = 'last-opportunity';
                            scope.message = 'Última oportunidade';
                            scope.expires = scope.product.expires * 1000;
                        } else {
                            scope.blockStyle[3] = '';
                        }

                        // #############################################################################################################
                        // Dialogs control
                        // #############################################################################################################
                        /**
                         * Opens the dialog to add a product to the basket and
                         * in the promise resolution add it to the basket ... or
                         * do nothing.
                         */
                        scope.add = function(product) {
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
                    }
                };
            }]);
}(angular));
