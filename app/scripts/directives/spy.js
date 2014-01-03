'use strict';

angular.module('glowingCatalogApp').directive('spy', function() {
    return {
        restrict : 'A',
        require : '^scrollSpy',
        link : function(scope, elem, attrs, ctrl) {

            var spyObj = {};

            attrs.$observe('spy', function(val) {

                spyObj = {
                    id : val,
                    'in' : function() {
                        return elem.addClass('active');
                    },
                    out : function() {
                        return elem.removeClass('active');
                    }
                };

                ctrl.addSpy(spyObj);

                if (val == 'cat0') {
                    elem.addClass('active');
                }
            });

            scope.$on('$destroy', function() {
                ctrl.delSpy(spyObj);
            });

            elem.bind('click', function() {
                ctrl.batata(attrs.spy);
            });
        }
    };
});