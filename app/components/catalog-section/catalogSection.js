(function(angular) {
    'use strict';

    var templateUrl = 'components/catalog-section/catalog-section.html';

    angular.module('glowingCatalogApp').run(function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.components.catalog-section', []).directive('catalogSection', function(DataProvider, ArrayUtils) {
        return {
            templateUrl : templateUrl,
            restrict : 'E',
            scope : {
                line : '='
            },
            link : function postLink(scope, element, attrs) {

                scope.lines = DataProvider.lines;

                var color = scope.line.color;

                scope.style = 'bg-' + color;
                scope.blockStyle = 'product-bg-' + color;

                var lineUp = ArrayUtils.find(DataProvider.products, 'line', scope.line.name);

                for ( var ix in lineUp) {
                    var product = lineUp[ix];

                    // if (product.description.length < 110) {
                    // product.w = 3;
                    // product.h = 3;
                    // } else
                    if (angular.isDefined(product.description) && product.description.length > 130) {
                        product.w = 6;
                        product.h = 3;
                    } else {
                        product.w = 6;
                        product.h = 2;
                    }
                }

                scope.left = [];
                scope.right = [];

                var total = 2;

                for ( var ix in lineUp) {
                    total += lineUp[ix].h;
                }

                var left = 2;
                var right = 0;

                for ( var ix in lineUp) {
                    if (left < total / 2) {
                        scope.left.push(lineUp[ix]);
                        left += lineUp[ix].h;
                    } else {
                        scope.right.push(lineUp[ix]);
                        right += lineUp[ix].h;
                    }
                }
            }
        };
    });
}(angular));