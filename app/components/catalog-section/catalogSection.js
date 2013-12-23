(function(angular) {
    'use strict';

    var templateUrl = 'components/catalog-section/catalog-section.html';

    angular.module('glowingCatalogApp').run(function($http, $templateCache) {

        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular.module('tnt.catalog.components.catalog-section', []).directive('catalogSection', function(DataProvider) {
        return {
            templateUrl : templateUrl,
            restrict : 'E',
            scope : true,
            link : function postLink(scope, element, attrs) {
                
                scope.lines = DataProvider.lines;
                
                var styles = function(){
                    
                    var color = '';
                    
                    if(angular.isDefined(scope.lines.find(scope.line)[0])){
                        color = scope.lines.find(scope.line)[0].color;
                    }
                    
                    scope.style = 'bg-' + color;
                    scope.blockStyle = 'product-bg-' + color;
                };
                
                scope.$watch('lines', function(val){
                    styles();
                }, true);
                
                scope.$on('DataProvider.update', function(){
                    var lineUp = DataProvider.products.find(undefined, scope.line);
                    var half = Math.round(lineUp.length/2)-1;
                    scope.left = [];
                    scope.right = [];
                    
                    for(var ix in lineUp){
                        if(ix < half){
                            scope.left.push(lineUp[ix]);
                        } else {
                            scope.right.push(lineUp[ix]);
                        }
                    }
                });
            }
        };
    });
}(angular));