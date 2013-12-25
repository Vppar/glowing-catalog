(function(angular) {
    'use strict';

    var templateUrl = 'components/product-display/product-display.html';

    // angular.module('tnt.catalog.components.product-display.template',
    // []).run(function($http, $templateCache) {
    angular.module('glowingCatalogApp').run(function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.components.product-display', []).directive('productDisplay', function(DataProvider, OrderService, DialogService) {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            scope : {
                product : '=',
                line : '='
            },
            link : function postLink(scope, element, attrs) {

                scope.blockStyle = [];
                scope.blockStyle[0] = 'w0' + scope.product.w;
                scope.blockStyle[1] = 'h0' + scope.product.h;
                scope.blockStyle[2] = 'product-bg-' + scope.line.color;

                if (angular.isDefined(scope.product.extra)) {
                    scope.blockStyle[3] = 'last-opportunity';
                } else {
                    scope.blockStyle[3] = '';
                }
                
             // #############################################################################################################
                // Dialogs control
                // #############################################################################################################
                /**
                 * Opens the dialog to add a product to the basket and in the
                 * promise resolution add it to the basket ... or do nothing.
                 */
                scope.add = function(product) {

                    if (OrderService.order.id === undefined) {
                        OrderService.createNew();
                    }

                    if (product.gridList.length > 1) {
                        DialogService.openDialogAddToBasketDetails({
                            id : product.id
                        });
                    } else {
                        DialogService.openDialogAddToBasket({
                            id : product.id
                        });
                    }

                };
            }
        };
    });
}(angular));