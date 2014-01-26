(function(angular) {
    'use strict';

    var templateUrl = 'components/catalog-highlights/catalog-highlights.html';

    angular.module('glowingCatalogApp').run(function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.components.catalog-highlights', []).directive(
            'catalogHighlights', function(DataProvider, ArrayUtils, ProductLineUp) {
                return {
                    templateUrl : templateUrl,
                    restrict : 'E',
                    replace : true,
                    scope : {
                        section : '='
                    },
                    link : function postLink(scope, element, attrs) {

                        function reload() {
                            switch (scope.section) {
                            case 'Promoções':
                                scope.color = 'color-dark-green';
                                break;
                            case 'Edição Limitada':
                                scope.color = 'dark-yellow-gray';
                                break;
                            case 'Lançamentos':
                                scope.color = 'dark-yellow';
                                break;
                            default:
                                scope.color = 'black';
                            }

                            scope.style = 'bg-' + scope.color;

                            var lineUp = ArrayUtils.list(DataProvider.products, 'session', scope.section);

                            for ( var ix in lineUp) {
                                lineUp[ix].displayLine = lineUp[ix].line;
                            }

                            scope.left = [];
                            scope.right = [];

                            ProductLineUp.lineUp(lineUp, scope.left, scope.right);
                        }
                        
                        scope.$watch('section', reload);
                        scope.$on('DataProvider.update', reload);
                    }
                };
            });

}(angular));