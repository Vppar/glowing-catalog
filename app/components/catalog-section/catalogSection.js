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
            replace: true,
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

                    if (angular.isUndefined(product.h)) {
                        if (angular.isDefined(product.description) && product.description.length < 110) {
                            product.w = 3;
                            product.h = 3;
                        } else if (angular.isDefined(product.description) && product.description.length > 130) {
                            product.w = 6;
                            product.h = 3;
                        } else {
                            product.w = 6;
                            product.h = 2;
                        }
                    }
                }

                // 3x3 must come in pairs
                var _3x3 = ArrayUtils.filter(lineUp, {
                    w : 3,
                    h : 3
                });
                if (_3x3.length % 2) {
                    var rogue = _3x3.pop();
                    rogue.w = 6;
                    rogue.h = 2;
                }

                scope.left = [];
                scope.right = [];

                var leftH = 2;
                var rightH = 0;

                function push(p1, p2) {
                    if (leftH > rightH) {
                        scope.right.push(p1);
                        rightH += p1.h;
                        if (p2) {
                            scope.right.push(p2);
                        }
                    } else {
                        scope.left.push(p1);
                        leftH += p1.h;
                        if (p2) {
                            scope.left.push(p2);
                        }
                    }
                }

                var cache = false;
                for ( var ix in lineUp) {
                    if (lineUp[ix].w === 3) {
                        if (cache) {
                            push(cache, lineUp[ix]);
                            cache = false;
                        } else {
                            cache = lineUp[ix];
                        }
                    } else {
                        push(lineUp[ix]);
                    }
                }

                function height(array) {
                    var h = 0;
                    for ( var ix in array) {
                        h += array[ix].h;
                    }
                    return h;
                }

                function shuffle(o) { // v1.0
                    for ( var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
                        ;
                    return o;
                }
            }
        };
    });
}(angular));