'use strict';

angular.module('glowingCatalogApp').directive('spy', function() {
    return {
        restrict : 'A',
        require : '^scrollSpy',
        link : function(scope, elem, attrs, ctrl) {
            
            attrs.$observe('spy', function(val){
                ctrl.addSpy({
                    id : val,
                    'in' : function() {
                        return elem.addClass('active');
                    },
                    out : function() {
                        return elem.removeClass('active');
                    }
                });
            });
            
            
            elem.bind('click', function(){
                ctrl.batata(attrs.spy);
            });
        }
    };
});