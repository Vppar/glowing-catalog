(function(angular) {
    'use strict';

    var templateUrl = 'components/d3-histogram/histogram.html';

    angular.module('glowingCatalogApp').run(['$http', '$templateCache', function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    }]);

    angular.module('tnt.chart.components.histogram', []).directive('histogram', function() {
        return {
            restrict : 'E',
            templateUrl : templateUrl,
            replace: true,
            scope : {
                values : '=values',
                tip : '=tip',
                height : '=height',
                bands : '=bands',
                firstcolor : '=firstcolor',
                lastcolor : '=lastcolor'
            },
            link: function (scope, element, attrs) {


                
            }
        }
    });
}(angular));