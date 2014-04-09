(function (angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('tntFocusIf', [function () {
        return {
            scope: {},
            link : function(scope, element, attrs){

            if(attrs.tntFocusIf==='true') {
                element[0].focus();
            };
        }

     }
    }]);
}(angular));
