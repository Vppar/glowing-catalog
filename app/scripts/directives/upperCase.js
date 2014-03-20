(function(angular) {
    'use strict';
    function upperCase($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                element.bind('blur', function(){
                    element.val($filter('uppercase')(element.val()));
                    element.trigger('input');
                });
            }
        };
    }
    angular.module('tnt.catalog.attrs.upperCase', []).directive('upperCase', ['$filter', upperCase]);
}(angular));
