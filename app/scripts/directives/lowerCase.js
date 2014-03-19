(function(angular) {
    'use strict';
    function lowerCase($filter) {
        return {
            link : function(scope, element, attrs) {
                element.bind('blur', function(){
                    element.val($filter('lowercase')(element.val()));
                    element.trigger('input');
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.lowerCase', []).directive('lowerCase', ['$filter', lowerCase]);
}(angular));
