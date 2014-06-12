(function(angular) {
    'use strict';

    var templateUrl = 'components/catalog-highlights/catalog-highlights.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.catalog.components.catalog-highlights', []).directive(
            'catalogHighlights', ['DataProvider', 'ArrayUtils', 'ProductLineUp', function(DataProvider, ArrayUtils, ProductLineUp) {
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
                            case 'Última Oportunidade':
                                scope.color = 'dark-magenta';
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

                            var filter = {
                                session : scope.section,
                                active : true
                            };

                            var lineUp = ArrayUtils.filter(DataProvider.products, filter);

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
            }]);

}(angular));
