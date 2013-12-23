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

    angular.module('tnt.catalog.components.product-display', []).directive('productDisplay', function(DataProvider) {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            scope : true,
            link : function postLink(scope, element, attrs) {

                scope.blockStyle = [];
                attrs.$observe('width', function(val) {
                    if (val === undefined) {
                        scope.blockStyle[0] = 'w06';
                    } else {
                        scope.blockStyle[0] = 'w0' + val;
                    }
                });
                attrs.$observe('height', function(val) {
                    if (val === undefined) {
                        scope.blockStyle[1] = 'h02';
                    } else {
                        scope.blockStyle[1] = 'h0' + val;
                    }
                });

                var color = '';

                if (angular.isDefined(DataProvider.lines.find(scope.product.line)[0])) {
                    color = DataProvider.lines.find(scope.product.line)[0].color;
                }

                scope.blockStyle[2] = 'product-bg-' + color;

                if (angular.isDefined(scope.product.extra)) {
                    scope.blockStyle[3] = 'last-opportunity';
                } else {
                    scope.blockStyle[3] = '';
                }
            }
        };
    });
}(angular));