(function(angular) {
    'use strict';

    var templateUrl = 'components/catalog-section/catalog-section.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.catalog.components.catalog-section', []).directive(
            'catalogSection', ['DataProvider', 'ArrayUtils', 'ProductLineUp', function(DataProvider, ArrayUtils, ProductLineUp) {
                return {
                    templateUrl : templateUrl,
                    restrict : 'E',
                    replace : true,
                    scope : {
                        line : '=',
                        section : '='
                    },
                    link : function postLink(scope, element, attrs) {

                        scope.color = scope.line.color;

                        scope.style = 'bg-' + scope.color;

                        var filter = {
                            line : scope.line.name,
                            session : scope.section
                        };

                        var lineUp = ArrayUtils.filter(DataProvider.products, filter);

                        scope.left = [];
                        scope.right = [];

                        ProductLineUp.lineUp(lineUp, scope.left, scope.right);

                        if (scope.$parent.$last) {
                            // FIXME the hierarchy is hard coded
                            // FIXME does not react to browser resizes
                            element.css('min-height', element.parent().parent().height() - 10);
                        }
                    }
                };
            }]);
}(angular));