(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('tntSelect2', function select2($filter) {
        return {
            restrict : 'A',
            link : function(scope, element, attrs, ctrl) {
                function closeNativeKeyBoard(){
                    element.attr('readonly', 'readonly'); 
                    element.attr('disabled', 'true'); 
                    setTimeout(function() {
                        //element.blur(); //just works at Android
                        $('input:focus').blur(); //works at iOS too
                        element.removeAttr('readonly');
                        element.removeAttr('disabled');
                    }, 100);
                }
                element.bind('click', closeNativeKeyBoard);
        
            }
        };
    });
}(angular));
