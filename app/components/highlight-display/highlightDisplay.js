(function(angular) {
    'use strict';

    var templateUrl = 'components/highlight-display/highlight-display.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.catalog.components.highlight-display', []).directive('highlightDisplay', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                line : '='
            },
            link : function postLink(scope, element, attrs) {
                scope.blockStyle = 'product-bg-' + scope.line.color;
            }
        };
    });
}(angular));