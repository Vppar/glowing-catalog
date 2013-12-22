(function(angular) {
    'use strict';

    var sizes = {
        _6x3 : {
            width : 6,
            height : 3
        },
        _6x2 : {
            width : 6,
            height : 2
        },
        _3x3 : {
            width : 3,
            height : 3
        },
    };
    
    var masterClasses = {
            
    };

    var templateUrl = 'components/product-display/product-display.html';

    angular.module('tnt.catalog.components.product-display.template', []).run(function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('glowingCatalogApp').directive('productDisplay', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,

            link : function postLink(scope, element, attrs) {
                var id = Number(attrs['productId']);
                var size = attrs['size'];

                scope.$watch('products', function() {
                    scope.product = scope.products.find(id)[0];
                }, true);
            }
        };
    });
}(angular));