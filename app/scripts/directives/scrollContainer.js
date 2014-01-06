(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').directive('scrollContainer', function() {
        return {
            restrict : 'A',
            require : '^scrollSpy',
            link : function postLink(scope, element, attrs, ctrl) {
                ctrl.registerContainer(attrs.id);
            }
        };
    });
})(angular);
