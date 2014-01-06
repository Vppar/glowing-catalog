(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('anchor', function() {
        return {
            restrict : 'A',
            require : '^scrollSpy',
            link : function postLink(scope, element, attrs, ctrl) {
                var anchorObj = {};

                attrs.$observe('id', function(val) {

                    anchorObj = {
                        id : val,
                        element : element
                    };

                    ctrl.addAnchor(anchorObj);
                });

                scope.$on('$destroy', function() {
                    ctrl.delAnchor(anchorObj);
                });
            }
        };
    });
})(angular);
